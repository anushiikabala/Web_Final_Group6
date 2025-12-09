# Backend/ai_engine/analyzer.py

import os
import json
import pickle
import re

from dotenv import load_dotenv
from groq import Groq
from sentence_transformers import SentenceTransformer
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter


load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

EMBED_DIR = "Embeddings"
os.makedirs(EMBED_DIR, exist_ok=True)


def analyze_report(pdf_path: str):
    """
    1. Read PDF
    2. Create embeddings & save <filename>.pkl in Embeddings/
    3. Ask Groq to return structured JSON
    4. Return (ai_summary, test_results, embedding_path)
    """

    # ------- 1. LOAD PDF TEXT -------
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=200)
    chunks = splitter.split_documents(documents)

    texts = [c.page_content for c in chunks]
    full_text = "\n\n".join(texts)

    # ------- 2. BUILD & SAVE EMBEDDINGS -------
    vectors = embedding_model.encode(texts, convert_to_numpy=True)

    base_name = os.path.splitext(os.path.basename(pdf_path))[0]
    embedding_path = os.path.join(EMBED_DIR, f"{base_name}.pkl")

    with open(embedding_path, "wb") as f:
        pickle.dump({"texts": texts, "vectors": vectors}, f)

    # ------- 3. ASK GROQ FOR STRUCTURED JSON -------
    prompt = f"""
You are a medical lab report analysis AI.

From this lab report text, extract a JSON object with this **exact** structure:

{{
  "summary": "Short overall overview in 2–3 sentences",
  "key_findings": ["finding 1", "finding 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "severity": "low" | "medium" | "high",
  "tests": [
    {{
      "name": "Test name",
      "value": "numeric or text value",
      "unit": "unit string",
      "normalRange": "e.g. 4.0 - 11.0",
      "status": "low" | "normal" | "high",
      "interpretation": "1–2 sentence explanation for this test"
    }}
  ]
}}

Rules:
- Return **ONLY valid JSON**. 
- No backticks, no Markdown, no extra text before or after the JSON.

Lab Report Text:
\"\"\"{full_text}\"\"\"
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )

    raw_content = response.choices[0].message.content.strip()

    # Sometimes models wrap JSON in ```...``` – strip that if needed
    if raw_content.startswith("```"):
        raw_content = re.sub(r"^```[a-zA-Z]*\n", "", raw_content)
        if raw_content.endswith("```"):
            raw_content = raw_content[:-3].strip()

    try:
        parsed = json.loads(raw_content)
    except json.JSONDecodeError:
        # Fallback: don't crash your app – just wrap the text
        parsed = {
            "summary": raw_content,
            "key_findings": [],
            "recommendations": [],
            "severity": "low",
            "tests": [],
        }

    ai_summary = {
        "overall": parsed.get("summary", ""),
        "keyFindings": parsed.get("key_findings", []),
        "recommendations": parsed.get("recommendations", []),
        "severity": parsed.get("severity", "low"),
    }

    test_results = parsed.get("tests", [])

    return ai_summary, test_results, embedding_path


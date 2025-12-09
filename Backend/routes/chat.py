from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import os
import numpy as np
import pickle
from groq import Groq
from sentence_transformers import SentenceTransformer

chat_bp = Blueprint("chat", __name__)

mongo = MongoClient("mongodb://localhost:27017/")
db = mongo["LabInsight"]
reports_col = db["reports"]

EMBED_DIR = "Embeddings"

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# -----------------------------------------------------------
# GET LATEST REPORT
# -----------------------------------------------------------
@chat_bp.route("/latest-report", methods=["GET"])
def latest_report():
    email = request.args.get("email")

    if not email:
        return jsonify({"error": "Email missing"}), 400

    report_cursor = reports_col.find({"user_email": email}).sort("uploaded_at", -1).limit(1)
    report_list = list(report_cursor)

    if not report_list:
        return jsonify({"report": None, "suggested_questions": []})

    report = report_list[0]

    return jsonify({
        "report": {
            "file_name": report["file_name"],
            "uploaded_at": report["uploaded_at"]
        },
        "embedding_path": report["embedding_path"],
        "suggested_questions": [
            "Summarize my latest lab report in simple words.",
            "Is there anything urgent in my latest lab report?",
            "Explain my latest hemoglobin result.",
            "Are my cholesterol and glucose values okay?",
            "What should I focus on improving based on my latest report?"
        ]
    })


# -----------------------------------------------------------
# RAG CHAT ENDPOINT
# -----------------------------------------------------------
@chat_bp.route("/ask", methods=["POST"])
def rag_chat():
    data = request.json
    question = data.get("question")
    email = data.get("email")

    if not question or not email:
        return jsonify({"answer": "Error: question + email required"}), 400

    # 1️⃣ GET LATEST REPORT FROM MONGO
    latest = reports_col.find_one(
        {"user_email": email},
        sort=[("uploaded_at", -1)]
    )

    if not latest:
        return jsonify({"answer": "No reports uploaded yet."})

    pkl_path = latest.get("embedding_path")

    if not pkl_path:
        return jsonify({"answer": "No embeddings found for this report."})

    if not os.path.exists(pkl_path):
        return jsonify({"answer": "Embedding file missing on server."})

    # 2️⃣ LOAD EMBEDDINGS (.pkl created by analyzer.py)
    try:
        with open(pkl_path, "rb") as f:
            emb = pickle.load(f)
    except Exception as e:
        return jsonify({"answer": f"Failed loading embeddings: {str(e)}"})

    vectors = emb.get("vectors")     # numpy array
    texts = emb.get("texts")         # list of chunks

    # ---- FIX: avoid ambiguous truth-value error ----
    if vectors is None or texts is None:
        return jsonify({"answer": "Invalid embedding file format."})

    # 3️⃣ ENCODE QUESTION
    q_embed = model.encode(question)

    # 4️⃣ RANK CHUNKS
    sims = np.dot(vectors, q_embed)  # shape (N,)
    top_idx = sims.argsort()[-3:][::-1]

    context = "\n\n".join([texts[i] for i in top_idx])

    # 5️⃣ CALL GROQ
    prompt = f"""
Use ONLY the medical report info below to answer:

{context}

Question: {question}

Give a clear, simple explanation suitable for a patient.
"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
        )

        answer = response.choices[0].message.content
        return jsonify({"answer": answer})

    except Exception as e:
        return jsonify({"answer": f"Groq API error: {str(e)}"})

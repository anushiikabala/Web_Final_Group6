# Backend/routes/upload.py

import os
import uuid
from datetime import datetime

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

from user_Db.mongo import reports
from ai_engine.analyzer import analyze_report

upload_bp = Blueprint("upload_bp", __name__)

UPLOAD_FOLDER = "UploadedPdfs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# -----------------------------
#  POST /upload-report
# -----------------------------
@upload_bp.route("/upload-report", methods=["POST"])
def upload_report():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    user_email = request.form.get("email")

    if not user_email:
        return jsonify({"error": "Email missing"}), 400

    # 1. Save PDF with SAME NAME in UploadedPdfs/
    original_name = secure_filename(file.filename)  # e.g. apc.pdf
    if not original_name:
        return jsonify({"error": "Invalid filename"}), 400

    saved_path = os.path.join(UPLOAD_FOLDER, original_name)
    file.save(saved_path)

    # 2. Create a unique id for this report
    file_id = str(uuid.uuid4())

    # 3. Run AI analysis (also creates <name>.pkl in Embeddings/)
    ai_summary, test_results, embedding_path = analyze_report(saved_path)

    # 4. Save in Mongo – THIS IS WHERE USER OWNERSHIP IS STORED
    report_doc = {
        "file_id": file_id,
        "user_email": user_email,          # <-- so "abc@gmail.com" owns this
        "file_name": original_name,
        "file_path": saved_path,
        "embedding_path": embedding_path,
        "ai_summary": ai_summary,
        "testResults": test_results,
        "uploaded_at": datetime.utcnow().isoformat(),
    }

    reports.insert_one(report_doc)

    return jsonify(
        {
            "message": "Upload Successful",
            "report_id": file_id,
            "ai_summary": ai_summary,
            "testResults": test_results,
        }
    ), 200


# -----------------------------
#  GET /reports?email=abc@gmail.com
#  → Used by ViewReports.tsx (per-user list)
# -----------------------------
@upload_bp.route("/reports", methods=["GET"])
def get_reports():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email query param required"}), 400

    docs = list(
        reports.find(
            {"user_email": email},
            {
                "_id": 0,
                "file_id": 1,
                "file_name": 1,
                "uploaded_at": 1,
                "ai_summary.severity": 1,
            },
        )
    )

    return jsonify({"reports": docs}), 200


# -----------------------------
#  GET /report/<report_id>
#  → Used by ReportInsights.tsx
# -----------------------------
@upload_bp.route("/report/<report_id>", methods=["GET"])
def get_single_report(report_id):
    doc = reports.find_one({"file_id": report_id}, {"_id": 0})
    if not doc:
        return jsonify({"error": "Report not found"}), 404
    return jsonify(doc), 200

@upload_bp.route("/delete-report/<file_id>", methods=["DELETE"])
def delete_report(file_id):
    deleted = reports.delete_one({"file_id": file_id})
    if deleted.deleted_count == 0:
        return jsonify({"error": "Report not found"}), 404

    return jsonify({"message": "Report deleted successfully"}), 200

@upload_bp.route("/all-reports", methods=["GET"])
def get_all_reports():
    email = request.args.get("email")
    docs = list(reports.find({"user_email": email}, {"_id": 0}))
    return jsonify({"reports": docs})



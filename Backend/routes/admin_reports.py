from flask import Blueprint, jsonify, send_file
from pymongo import MongoClient
from bson import ObjectId
import os

mongo = MongoClient("mongodb://localhost:27017/")
db = mongo["LabInsight"]

users_col = db["users"]
reports_col = db["reports"]

admin_reports_bp = Blueprint("admin_reports", __name__)

# ------------------------------------------------
# 1️⃣ GET ALL REPORTS FOR ADMIN PANEL
# ------------------------------------------------
@admin_reports_bp.route("/reports", methods=["GET"])
def get_all_reports():
    reports = list(reports_col.find({}))

    result = []
    for r in reports:
        user = users_col.find_one({"email": r["user_email"]})

        # Map AI severity → UI status
        severity = r.get("ai_summary", {}).get("severity", "low")
        if severity == "low":
            ui_status = "normal"
        elif severity == "medium":
            ui_status = "abnormal"
        else:
            ui_status = "critical"

        result.append({
            "_id": str(r["_id"]),
            "userName": user["name"] if user else "Unknown",
            "userEmail": r["user_email"],
            "reportName": r["file_name"],
            "uploadDate": r["uploaded_at"],
            "type": "Lab Report",
            "totalTests": len(r.get("testResults", [])),
            "abnormalCount": len([t for t in r.get("testResults", []) if t["status"] != "normal"]),
            "status": ui_status,
            "file_path": r["file_path"]
        })

    return jsonify({"reports": result})


# ------------------------------------------------
# 2️⃣ DELETE REPORT
# ------------------------------------------------
@admin_reports_bp.route("/reports/<report_id>", methods=["DELETE"])
def delete_report(report_id):
    report = reports_col.find_one({"_id": ObjectId(report_id)})

    if not report:
        return jsonify({"error": "Report not found"}), 404

    # delete PDF file
    file_path = report.get("file_path")
    if file_path and os.path.exists(file_path):
        os.remove(file_path)

    # delete record
    reports_col.delete_one({"_id": ObjectId(report_id)})

    return jsonify({"message": "Report deleted successfully"})


# ------------------------------------------------
# 3️⃣ DOWNLOAD PDF
# ------------------------------------------------
@admin_reports_bp.route("/download/<report_id>", methods=["GET"])
def download_report(report_id):
    r = reports_col.find_one({"_id": ObjectId(report_id)})

    if not r:
        return jsonify({"error": "Report not found"}), 404

    return send_file(r["file_path"], as_attachment=True)


# ------------------------------------------------
# 4️⃣ VIEW PDF (open in browser)
# ------------------------------------------------
@admin_reports_bp.route("/view/<report_id>", methods=["GET"])
def view_report(report_id):
    r = reports_col.find_one({"_id": ObjectId(report_id)})

    if not r:
        return jsonify({"error": "Report not found"}), 404

    return send_file(r["file_path"])


# ------------------------------------------------
# 5️⃣ DASHBOARD SUMMARY DATA
# ------------------------------------------------

# @admin_reports_bp.route("/dashboard/stats", methods=["GET"])
# def dashboard_stats():
#     total_users = users_col.count_documents({})
#     total_reports = reports_col.count_documents({})

#     # Example: count reports uploaded today
#     from datetime import datetime, timedelta
#     today = datetime.utcnow().date()
#     active_today = reports_col.count_documents({
#         "uploaded_at": {"$gte": str(today)}
#     })

#     avg_reports_per_user = round(total_reports / total_users, 2) if total_users > 0 else 0

#     return jsonify({
#         "total_users": total_users,
#         "total_reports": total_reports,
#         "active_today": active_today,
#         "avg_reports_per_user": avg_reports_per_user
#     })
# @admin_reports_bp.route("/dashboard/activity", methods=["GET"])
# def dashboard_activity():
#     recent = list(
#         reports_col.find({}, {"file_name":1, "user_email":1, "uploaded_at":1})
#                     .sort("_id", -1)
#                     .limit(5)
#     )

#     result = []
#     for r in recent:
#         user = users_col.find_one({"email": r["user_email"]})
#         result.append({
#             "user": user["name"] if user else "Unknown",
#             "action": f"uploaded {r['file_name']}",
#             "time": "just now"   # optional: convert timestamp
#         })

#     return jsonify({"activity": result})
# @admin_reports_bp.route("/dashboard/growth", methods=["GET"])
# def dashboard_growth():
#     pipeline = [
#         {"$group": {
#             "_id": {"$substr": ["$uploaded_at", 0, 7]},  # YYYY-MM
#             "count": {"$sum": 1}
#         }},
#         {"$sort": {"_id": 1}}
#     ]

#     data = list(reports_col.aggregate(pipeline))

#     result = [
#         {"month": d["_id"], "users": d["count"]}
#         for d in data
#     ]

#     return jsonify({"growth": result})
# @admin_reports_bp.route("/dashboard/test-types", methods=["GET"])
# def dashboard_test_types():
#     pipeline = [
#         {"$group": {
#             "_id": "$file_name",
#             "count": {"$sum": 1}
#         }},
#         {"$sort": {"count": -1}},
#         {"$limit": 5}
#     ]

#     data = list(reports_col.aggregate(pipeline))

#     return jsonify({
#         "types": [
#             {"type": d["_id"], "count": d["count"]}
#             for d in data
#         ]
#     })


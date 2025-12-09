from flask import Blueprint, jsonify
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from collections import Counter

mongo = MongoClient("mongodb://localhost:27017/")
db = mongo["LabInsight"]

users_col = db["users"]
reports_col = db["reports"]

admin_dashboard_bp = Blueprint("admin_dashboard", __name__)


# ------------------------------------------------
# 1️⃣ USER GROWTH (COUNT USERS PER MONTH)
# ------------------------------------------------
@admin_dashboard_bp.route("/dashboard/user-growth", methods=["GET"])
def user_growth():
    users = list(users_col.find({}))

    monthly = {}

    for u in users:
        created = u.get("created_at", datetime.now())
        month = created.strftime("%Y-%m")
        monthly[month] = monthly.get(month, 0) + 1

    # Convert to list format for frontend
    data = [{"month": m, "count": monthly[m]} for m in sorted(monthly.keys())]

    return jsonify({"growth": data})


# ------------------------------------------------
# 2️⃣ RECENT ACTIVITY (LAST 5 REPORT UPLOADS)
# ------------------------------------------------
@admin_dashboard_bp.route("/dashboard/recent-activity", methods=["GET"])
def recent_activity():
    reports = list(reports_col.find().sort("uploaded_at", -1).limit(5))

    result = []
    for r in reports:
        result.append({
            "user": r.get("user_email"),
            "action": f"uploaded {r.get('file_name')}",
            "time": r.get("uploaded_at")
        })

    return jsonify({"recent": result})


# ------------------------------------------------
# 3️⃣ REPORT STATUS COUNTS (normal / abnormal / critical)
# ------------------------------------------------
@admin_dashboard_bp.route("/dashboard/report-status", methods=["GET"])
def report_status():
    reports = list(reports_col.find({}))

    status_count = {"normal": 0, "abnormal": 0, "critical": 0}

    for r in reports:
        sev = r.get("ai_summary", {}).get("severity", "low")

        if sev == "low":
            status_count["normal"] += 1
        elif sev == "medium":
            status_count["abnormal"] += 1
        else:
            status_count["critical"] += 1

    return jsonify(status_count)

from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from datetime import datetime
from dateutil.parser import parse


mongo = MongoClient("mongodb://localhost:27017/")
db = mongo["LabInsight"]

users_col = db["users"]
reports_col = db["reports"]

admin_bp = Blueprint("admin", __name__)

# ------------------------------
# 1️⃣ GET ALL USERS WITH REPORT COUNT
# ------------------------------
@admin_bp.route("/users", methods=["GET"])
def get_all_users():
    from dateutil.parser import parse   # <-- FIX

    users = list(users_col.find({}, {"_id": 0, "password": 0}))

    result = []
    for user in users:
        email = user["email"]

        # Count reports for this user
        reports_count = reports_col.count_documents({"user_email": email})

        # Get last activity
        last_report = reports_col.find_one(
            {"user_email": email},
            sort=[("uploaded_at", -1)]
        )

        if last_report:
            uploaded_at = last_report["uploaded_at"]
            # uploaded_at may be string or datetime → fix BOTH cases
            try:
                uploaded_dt = parse(uploaded_at) if isinstance(uploaded_at, str) else uploaded_at
                last_active = uploaded_dt.strftime("%Y-%m-%d %H:%M")
            except:
                last_active = "Unknown"
        else:
            last_active = "Never"

        result.append({
            "name": user.get("name", ""),
            "email": email,
            "joinDate": user.get("created_at", "2024-01-01"),
            "status": user.get("status", "active"),
            "reportsCount": reports_count,
            "lastActive": last_active
        })

    return jsonify({"users": result})


# ------------------------------
# 2️⃣ UPDATE USER STATUS
# ------------------------------
@admin_bp.route("/users/<email>/status", methods=["PUT"])
def update_status(email):
    new_status = request.json.get("status")

    if new_status not in ["active", "suspended", "pending"]:
        return jsonify({"error": "Invalid status"}), 400

    users_col.update_one(
        {"email": email},
        {"$set": {"status": new_status}}
    )

    return jsonify({"message": "Status updated"})


@admin_bp.route("/users/<email>", methods=["DELETE"])
def delete_user(email):
    email = email.replace("%40", "@")  # just in case

    users_col.delete_one({"email": email})
    reports_col.delete_many({"user_email": email})

    return jsonify({"message": "User deleted successfully"})

@admin_bp.route("/users/<email>", methods=["PUT"])
def edit_user(email):
    data = request.json
    name = data.get("name")

    users_col.update_one(
        {"email": email},
        {"$set": {"name": name}}
    )

    return jsonify({"message": "User updated"})


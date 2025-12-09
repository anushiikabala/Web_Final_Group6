from flask import Blueprint, request, jsonify
from user_Db.mongo import find_profile, update_profile

profile_bp = Blueprint("profile", __name__)

@profile_bp.get("/profile")
def get_profile():
    email = request.args.get("email")

    prof = find_profile(email)
    if not prof:
        return jsonify({"error": "Profile not found"}), 404

    prof["_id"] = str(prof["_id"])
    return jsonify(prof), 200


@profile_bp.put("/profile")
def save_profile():
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email required"}), 400

    update_profile(email, data)
    return jsonify({"message": "Profile updated"}), 200

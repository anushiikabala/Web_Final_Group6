from flask import Blueprint, request, jsonify
from user_Db.mongo import create_user, find_user, create_profile, update_password

auth = Blueprint("auth", __name__)

@auth.post("/signup")
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if find_user(email):
        return jsonify({"error": "User already exists"}), 400

    create_user({"name": name, "email": email, "password": password})

    create_profile({
        "name": name,
        "email": email,
        "phone": "",
        "dateOfBirth": "",
        "age": "",
        "gender": "",
        "bloodType": "",
        "height": "",
        "weight": "",
        "address": "",
        "medicalConditions": [],
        "allergies": [],
        "medications": [],
        "unitPreference": "metric"
    })

    return jsonify({"message": "User created, profile initialized"}), 201


# ✅ LOGIN ONLY HERE
@auth.post("/login")
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = find_user(email)

    if not user:
        return jsonify({"error": "User does not exist"}), 400

    if user["password"] != password:
        return jsonify({"error": "Incorrect password"}), 401

    return jsonify({"message": "Login successful", "email": email}), 200


# ---------------- CHANGE PASSWORD ----------------
@auth.post("/change-password")
def change_password():
    data = request.json

    email = data.get("email")
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    user = find_user(email)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user["password"] != current_password:
        return jsonify({"error": "Current password is incorrect"}), 401

    update_password(email, new_password)

    return jsonify({"message": "Password updated successfully"}), 200
    data = request.json

    email = data.get("email")
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    user = find_user(email)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user["password"] != current_password:
        return jsonify({"error": "Current password is incorrect"}), 401

    update_password(email, new_password)

    return jsonify({"message": "Password updated successfully"}), 200

    data = request.json
    email = data.get("email")
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    user = find_user(email)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user["password"] != current_password:
        return jsonify({"error": "Current password is incorrect"}), 401

    update_password(email, new_password)

    return jsonify({"message": "Password updated successfully"}), 200


    data = request.json
    email = data.get("email")
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    user = find_user(email)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user["password"] != current_password:
        return jsonify({"error": "Current password is incorrect"}), 401

    update_password(email, new_password)
    return jsonify({"message": "Password updated successfully"}), 200

    data = request.json
    email = data.get("email")
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    user = find_user(email)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user["password"] != current_password:
        return jsonify({"error": "Current password is incorrect"}), 401

    update_password(email, new_password)
    return jsonify({"message": "Password updated successfully"}), 200
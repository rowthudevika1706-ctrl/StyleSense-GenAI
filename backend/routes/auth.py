from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user import create_user, verify_user, get_user_by_id
from middleware.auth_middleware import jwt_required_custom, get_current_user_id

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    name = data.get("name", "").strip()

    if not email or not password or not name:
        return jsonify({"error": "Email, password, and name are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    result = create_user(email, password, name)

    if "error" in result:
        return jsonify(result), 409

    user = result["user"]
    token = create_access_token(identity=str(user["_id"]))

    return jsonify({
        "message": "Account created successfully",
        "token": token,
        "user": {
            "id": user["_id"],
            "name": user["name"],
            "email": user["email"],
            "profile": user.get("profile", {})
        }
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    result = verify_user(email, password)

    if "error" in result:
        return jsonify(result), 401

    user = result["user"]
    token = create_access_token(identity=str(user["_id"]))

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user["_id"],
            "name": user["name"],
            "email": user["email"],
            "profile": user.get("profile", {})
        }
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required_custom
def me():
    user_id = get_current_user_id()
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "user": {
            "id": user["_id"],
            "name": user["name"],
            "email": user["email"],
            "profile": user.get("profile", {}),
            "saved_outfits": user.get("saved_outfits", []),
            "past_preferences": user.get("past_preferences", [])
        }
    }), 200
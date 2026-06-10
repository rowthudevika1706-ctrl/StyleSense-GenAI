from flask import Blueprint, request, jsonify
from middleware.auth_middleware import jwt_required_custom, get_current_user_id
from models.user import update_user_profile, get_user_by_id

profile_bp = Blueprint("profile", __name__)

VALID_GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"]
VALID_OCCASIONS = ["Casual", "College", "Office", "Party", "Formal", "Wedding"]


@profile_bp.route("/update", methods=["PUT"])
@jwt_required_custom
def update_profile():
    """Update user style preferences."""
    user_id = get_current_user_id()
    data = request.get_json()

    allowed_fields = ["gender", "occasion", "age", "budget"]
    profile_data = {k: v for k, v in data.items() if k in allowed_fields}

    if "budget" in profile_data:
        try:
            profile_data["budget"] = int(profile_data["budget"])
        except (ValueError, TypeError):
            return jsonify({"error": "Budget must be a number"}), 400

    if "age" in profile_data:
        if profile_data["age"] is not None and profile_data["age"] != "":
            try:
                profile_data["age"] = int(profile_data["age"])
                if profile_data["age"] <= 0:
                    return jsonify({"error": "Age must be greater than 0"}), 400
            except (ValueError, TypeError):
                return jsonify({"error": "Age must be a number"}), 400
        else:
            profile_data["age"] = None

    if not profile_data:
        return jsonify({"error": "No valid fields to update"}), 400

    success = update_user_profile(user_id, profile_data)
    if success:
        user = get_user_by_id(user_id)
        return jsonify({
            "message": "Profile updated",
            "profile": user.get("profile", {})
        }), 200

    return jsonify({"error": "Could not update profile"}), 500


@profile_bp.route("/", methods=["GET"])
@jwt_required_custom
def get_profile():
    """Get user profile."""
    user_id = get_current_user_id()
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "profile": user.get("profile", {}),
        "name": user.get("name"),
        "email": user.get("email"),
        "past_preferences": user.get("past_preferences", []),
        "saved_outfits_count": len(user.get("saved_outfits", []))
    }), 200


@profile_bp.route("/options", methods=["GET"])
def get_options():
    """Get available profile options."""
    return jsonify({
        "genders": VALID_GENDERS,
        "occasions": VALID_OCCASIONS
    }), 200
from flask import Blueprint, request, jsonify
from middleware.auth_middleware import jwt_required_custom, get_current_user_id
from models.recommendation import get_user_history, get_recommendation_by_id

history_bp = Blueprint("history", __name__)


@history_bp.route("/", methods=["GET"])
@jwt_required_custom
def get_history():
    """Get user's recommendation history."""
    user_id = get_current_user_id()
    limit = int(request.args.get("limit", 20))
    history = get_user_history(user_id, limit=limit)
    return jsonify({"history": history, "count": len(history)}), 200


@history_bp.route("/<rec_id>", methods=["GET"])
@jwt_required_custom
def get_single(rec_id):
    """Get a specific recommendation session."""
    user_id = get_current_user_id()
    rec = get_recommendation_by_id(rec_id, user_id)
    if not rec:
        return jsonify({"error": "Recommendation not found"}), 404
    return jsonify(rec), 200
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from functools import wraps


def jwt_required_custom(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": "Authentication required", "details": str(e)}), 401
    return decorated


def get_current_user_id() -> str:
    """Get the current authenticated user ID from JWT."""
    return get_jwt_identity()
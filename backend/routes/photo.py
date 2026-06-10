from flask import Blueprint, request, jsonify
from middleware.auth_middleware import jwt_required_custom, get_current_user_id
from utils.skin_tone import detect_skin_tone, get_color_palette
from models.user import update_skin_tone
import base64

photo_bp = Blueprint("photo", __name__)


@photo_bp.route("/analyze", methods=["POST"])
@jwt_required_custom
def analyze_photo():
    """Analyze uploaded photo for skin tone detection."""
    user_id = get_current_user_id()
    data = request.get_json()

    image_data = data.get("image")
    if not image_data:
        return jsonify({"error": "No image provided"}), 400

    # Detect skin tone
    result = detect_skin_tone(image_data)

    if "error" in result and not result.get("detected"):
        return jsonify({
            "error": "Could not detect face in image. Please upload a clear photo.",
            "details": result.get("error")
        }), 422

    skin_tone = result["skin_tone"]
    skin_hex = result.get("hex", "#b48c6e")

    # Save to user profile
    update_skin_tone(user_id, skin_tone, skin_hex)

    # Get color palette recommendations
    palette = get_color_palette(skin_tone)

    return jsonify({
        "skin_tone": skin_tone,
        "skin_hex": skin_hex,
        "rgb": result.get("rgb"),
        "color_palette": palette,
        "message": f"Skin tone detected: {skin_tone}"
    }), 200
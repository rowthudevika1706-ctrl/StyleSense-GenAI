from flask import Blueprint, request, jsonify
from middleware.auth_middleware import jwt_required_custom, get_current_user_id
from utils.groq_ai import generate_chat_response, is_fashion_related
from models.user import get_user_by_id
from db import get_collection
from datetime import datetime

chatbot_bp = Blueprint("chatbot", __name__)

OUT_OF_SCOPE_RESPONSE = (
    "I'm StyleSense AI, a fashion-focused assistant. I can help with outfits, "
    "styling advice, fashion trends, color matching, and wardrobe recommendations. "
    "Please ask a fashion-related question."
)

@chatbot_bp.route("/message", methods=["POST"])
@jwt_required_custom
def chat():
    """Handle fashion chatbot message with validation and persistence."""
    user_id = get_current_user_id()
    data = request.get_json()

    message = data.get("message", "").strip()
    # History from request can be passed or we can query DB
    conversation_history = data.get("history", [])

    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400

    if len(message) > 500:
        return jsonify({"error": "Message too long (max 500 characters)"}), 400

    chats_col = get_collection("chats")
    
    # 1. Save User Message to DB
    user_chat_doc = {
        "userId": user_id,
        "role": "user",
        "message": message,
        "timestamp": datetime.utcnow()
    }
    chats_col.insert_one(user_chat_doc)

    # 2. Before-Sending Validation
    if not is_fashion_related(message):
        # Save Assistant Out-of-Scope Response to DB
        assistant_chat_doc = {
            "userId": user_id,
            "role": "assistant",
            "message": OUT_OF_SCOPE_RESPONSE,
            "timestamp": datetime.utcnow()
        }
        chats_col.insert_one(assistant_chat_doc)
        return jsonify({
            "response": OUT_OF_SCOPE_RESPONSE,
            "message": message
        }), 200

    # Get user profile for personalization
    user = get_user_by_id(user_id)
    user_profile = user.get("profile", {}) if user else {}

    # Generate chatbot response
    raw_response = generate_chat_response(
        user_message=message,
        user_profile=user_profile,
        conversation_history=conversation_history
    )

    # 3. After-Receiving Validation
    final_response = raw_response
    if not is_fashion_related(raw_response):
        final_response = OUT_OF_SCOPE_RESPONSE

    # 4. Save Assistant Response to DB
    assistant_chat_doc = {
        "userId": user_id,
        "role": "assistant",
        "message": final_response,
        "timestamp": datetime.utcnow()
    }
    chats_col.insert_one(assistant_chat_doc)

    return jsonify({
        "response": final_response,
        "message": message
    }), 200


@chatbot_bp.route("/history", methods=["GET"])
@jwt_required_custom
def get_chat_history():
    """Retrieve chat history with optional search filtering, sorted by latest timestamp."""
    user_id = get_current_user_id()
    search_query = request.args.get("search", "").strip()

    chats_col = get_collection("chats")
    query = {"userId": user_id}
    
    if search_query:
        query["message"] = {"$regex": search_query, "$options": "i"}

    # Sort by timestamp ascending for sequential conversation rendering
    cursor = chats_col.find(query).sort("timestamp", 1)

    history = []
    for doc in cursor:
        history.append({
            "userId": doc["userId"],
            "role": doc["role"],
            "message": doc["message"],
            "timestamp": doc["timestamp"].isoformat() if isinstance(doc["timestamp"], datetime) else doc["timestamp"]
        })

    return jsonify({"history": history, "count": len(history)}), 200
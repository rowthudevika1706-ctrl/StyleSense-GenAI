from db import get_collection
from bson import ObjectId
from datetime import datetime


def save_recommendation(user_id: str, session_data: dict) -> str:
    """Save a full recommendation session."""
    recommendations = get_collection("recommendations")

    doc = {
        "user_id": user_id,
        "skin_tone": session_data.get("skin_tone"),
        "skin_hex": session_data.get("skin_hex"),
        "preferences": {
            "gender": session_data.get("gender"),
            "occasion": session_data.get("occasion"),
            "style_preference": session_data.get("style_preference"),
            "budget": session_data.get("budget")
        },
        "outfits": session_data.get("outfits", []),
        "color_palette": session_data.get("color_palette"),
        "overall_advice": session_data.get("overall_advice"),
        "created_at": datetime.utcnow()
    }

    result = recommendations.insert_one(doc)
    return str(result.inserted_id)


def get_user_history(user_id: str, limit: int = 20) -> list:
    """Get user's recommendation history."""
    recommendations = get_collection("recommendations")
    cursor = recommendations.find(
        {"user_id": user_id},
        sort=[("created_at", -1)],
        limit=limit
    )

    history = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["created_at"] = doc["created_at"].isoformat()
        history.append(doc)

    return history


def get_recommendation_by_id(rec_id: str, user_id: str) -> dict | None:
    """Fetch a specific recommendation session."""
    recommendations = get_collection("recommendations")
    try:
        doc = recommendations.find_one({
            "_id": ObjectId(rec_id),
            "user_id": user_id
        })
        if doc:
            doc["_id"] = str(doc["_id"])
            doc["created_at"] = doc["created_at"].isoformat()
        return doc
    except Exception:
        return None
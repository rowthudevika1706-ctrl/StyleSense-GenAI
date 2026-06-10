from db import get_collection
from bson import ObjectId
from datetime import datetime
import bcrypt


def create_user(email: str, password: str, name: str) -> dict:
    """Create a new user with hashed password."""
    users = get_collection("users")

    if users.find_one({"email": email}):
        return {"error": "Email already registered"}

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    user = {
        "email": email,
        "password": hashed,
        "name": name,
        "profile": {
            "gender": None,
            "occasion": None,
            "age": None,
            "budget": 2000,
            "skin_tone": None,
            "skin_hex": None
        },
        "saved_outfits": [],
        "past_preferences": [],
        "created_at": datetime.utcnow()
    }

    result = users.insert_one(user)
    user["_id"] = str(result.inserted_id)
    user.pop("password", None)
    return {"user": user}


def verify_user(email: str, password: str) -> dict:
    """Verify user credentials."""
    users = get_collection("users")
    user = users.find_one({"email": email})

    if not user:
        return {"error": "Invalid email or password"}

    if not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return {"error": "Invalid email or password"}

    user["_id"] = str(user["_id"])
    user.pop("password", None)
    return {"user": user}


def get_user_by_id(user_id: str) -> dict | None:
    """Fetch user by ID."""
    users = get_collection("users")
    try:
        user = users.find_one({"_id": ObjectId(user_id)})
        if user:
            user["_id"] = str(user["_id"])
            user.pop("password", None)
        return user
    except Exception:
        return None


def update_user_profile(user_id: str, profile_data: dict) -> bool:
    """Update user profile preferences."""
    users = get_collection("users")
    try:
        update_fields = {f"profile.{k}": v for k, v in profile_data.items()}
        result = users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )
        return result.modified_count > 0
    except Exception:
        return False


def update_skin_tone(user_id: str, skin_tone: str, skin_hex: str) -> bool:
    """Update user's detected skin tone."""
    users = get_collection("users")
    try:
        result = users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"profile.skin_tone": skin_tone, "profile.skin_hex": skin_hex}}
        )
        return result.modified_count > 0
    except Exception:
        return False


def save_outfit(user_id: str, outfit: dict) -> bool:
    """Save an outfit to user's favorites."""
    users = get_collection("users")
    try:
        outfit["saved_at"] = datetime.utcnow().isoformat()
        result = users.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"saved_outfits": outfit}}
        )
        return result.modified_count > 0
    except Exception:
        return False


def get_saved_outfits(user_id: str) -> list:
    """Get user's saved outfits."""
    user = get_user_by_id(user_id)
    if user:
        return user.get("saved_outfits", [])
    return []


def remove_saved_outfit(user_id: str, outfit_name: str) -> bool:
    """Remove a saved outfit by name."""
    users = get_collection("users")
    try:
        result = users.update_one(
            {"_id": ObjectId(user_id)},
            {"$pull": {"saved_outfits": {"name": outfit_name}}}
        )
        return result.modified_count > 0
    except Exception:
        return False


def add_past_preference(user_id: str, preference: str) -> bool:
    """Add a style preference to user history (max 20 kept)."""
    users = get_collection("users")
    try:
        users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$push": {
                    "past_preferences": {
                        "$each": [preference],
                        "$slice": -20
                    }
                }
            }
        )
        return True
    except Exception:
        return False
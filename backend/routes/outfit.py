from flask import Blueprint, request, jsonify
from middleware.auth_middleware import jwt_required_custom, get_current_user_id
from utils.groq_ai import generate_outfit_recommendations, build_shopping_links, generate_product_search_queries
from utils.skin_tone import get_color_palette
from models.user import get_user_by_id, save_outfit, remove_saved_outfit, add_past_preference, get_saved_outfits
from models.recommendation import save_recommendation
import re
import traceback

outfit_bp = Blueprint("outfit", __name__)


def _parse_cost(val):
    """Safely parse an estimated_cost value into an integer (rupee units).
    Accepts int/float or numeric strings like '500', '₹500', '500.0', '1,200'."""
    try:
        if val is None:
            return 0
        if isinstance(val, (int, float)):
            return int(val)
        if isinstance(val, str):
            cleaned = re.sub(r"[^0-9.]", "", val)
            if cleaned == "":
                return 0
            return int(float(cleaned))
    except Exception:
        return 0
    return 0


@outfit_bp.route("/generate", methods=["POST"])
@jwt_required_custom
def generate_outfit():
    """Generate AI outfit recommendations."""
    try:
        user_id = get_current_user_id()
        data = request.get_json() or {}

        # Get user for past preferences and skin tone
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        user_profile = user.get("profile", {}) if user else {}

        # Parameters from request or user profile
        skin_tone = data.get("skin_tone") or user_profile.get("skin_tone") or "Medium"
        skin_hex = data.get("skin_hex") or user_profile.get("skin_hex") or "#b48c6e"
        gender = data.get("gender") or user_profile.get("gender") or "Unisex"
        occasion = data.get("occasion") or user_profile.get("occasion") or "Casual"
        age = data.get("age") or user_profile.get("age")
        budget = _parse_cost(data.get("budget") or user_profile.get("budget") or 2000)
        past_preferences = user.get("past_preferences", []) if user else []

        # Get color palette
        color_palette = get_color_palette(skin_tone)

        if data.get("mode") == "build_around":
            from utils.image_analyzer import analyze_clothing_image, allocate_budgets
            from utils.groq_ai import generate_build_around_recommendations

            selected_categories = data.get("selected_categories") or []
            base_item_name = data.get("base_item_name") or ""
            base_item_image = data.get("base_item_image") or None

            # Smart budget allocation
            allocations = allocate_budgets(budget, selected_categories)

            # Analyze image for color and pattern
            detected_color = None
            detected_pattern = None
            if base_item_image:
                analysis = analyze_clothing_image(base_item_image)
                if analysis.get("success"):
                    detected_color = analysis.get("color_name")
                    detected_pattern = analysis.get("pattern")

            # Call groq for build_around mode
            result = generate_build_around_recommendations(
                gender=gender,
                occasion=occasion,
                budget=budget,
                base_item_name=base_item_name,
                selected_categories=selected_categories,
                budget_allocations=allocations,
                detected_color=detected_color,
                detected_pattern=detected_pattern,
                age=age,
                color_palette=color_palette,
                skin_tone=skin_tone
            )
        else:
            # Generate recommendations from Groq (default whole outfit)
            result = generate_outfit_recommendations(
                skin_tone=skin_tone,
                gender=gender,
                occasion=occasion,
                budget=budget,
                age=age,
                past_preferences=past_preferences,
                color_palette=color_palette
            )

        if not result["success"]:
            return jsonify({"error": "Failed to generate recommendations", "details": result.get("error")}), 502

        ai_data = result["data"]
        outfits = ai_data.get("outfits", [])

        if data.get("mode") == "build_around":
            selected_categories = data.get("selected_categories") or []
            selected_cats_lower = [c.lower().strip() for c in selected_categories]
            from utils.image_analyzer import allocate_budgets
            allocations = allocate_budgets(budget, selected_categories)

            top_kws = ["jacket", "shrug", "shirt", "top", "kurta", "kurti", "sherwani", "nehru", "saree", "lehenga", "blouse", "anarkali", "ethnic jacket"]
            bottom_kws = ["pant", "jeans", "trouser", "skirt", "palazzo", "salwar", "churidar"]
            acc_kws = ["watch", "belt", "bag", "handbag", "sunglass", "jeweller", "accessor", "dupatta"]

            has_top = any(any(kw in c for kw in top_kws) for c in selected_cats_lower)
            has_bottom = any(any(kw in c for kw in bottom_kws) for c in selected_cats_lower)
            has_footwear = any("shoe" in c or "footwear" in c for c in selected_cats_lower)
            has_accessories = any(any(kw in c for kw in acc_kws) for c in selected_cats_lower)

            for outfit in outfits:
                # 1. Strip unselected categories
                if not has_top and "top" in outfit:
                    outfit["top"] = None
                if not has_bottom and "bottom" in outfit:
                    outfit["bottom"] = None
                if not has_footwear and "footwear" in outfit:
                    outfit["footwear"] = None
                if not has_accessories and "accessories" in outfit:
                    outfit["accessories"] = []

                # 2. Enforce the exact budget allocations
                if outfit.get("top") and isinstance(outfit["top"], dict):
                    cat_name = next((c for c in selected_categories if any(kw in c.lower() for kw in top_kws)), None)
                    if cat_name:
                        outfit["top"]["estimated_cost"] = allocations.get(cat_name, outfit["top"].get("estimated_cost", 0))

                if outfit.get("bottom") and isinstance(outfit["bottom"], dict):
                    cat_name = next((c for c in selected_categories if any(kw in c.lower() for kw in bottom_kws)), None)
                    if cat_name:
                        outfit["bottom"]["estimated_cost"] = allocations.get(cat_name, outfit["bottom"].get("estimated_cost", 0))

                if outfit.get("footwear") and isinstance(outfit["footwear"], dict):
                    cat_name = next((c for c in selected_categories if "shoe" in c.lower() or "footwear" in c.lower()), None)
                    if cat_name:
                        outfit["footwear"]["estimated_cost"] = allocations.get(cat_name, outfit["footwear"].get("estimated_cost", 0))

                if outfit.get("accessories") and isinstance(outfit["accessories"], list):
                    acc_cats = [c for c in selected_categories if any(kw in c.lower() for kw in acc_kws)]
                    filtered_accs = []
                    for idx, acc_item in enumerate(outfit["accessories"]):
                        if isinstance(acc_item, dict) and idx < len(acc_cats):
                            cat_name = acc_cats[idx]
                            acc_item["estimated_cost"] = allocations.get(cat_name, acc_item.get("estimated_cost", 0))
                            filtered_accs.append(acc_item)
                    outfit["accessories"] = filtered_accs

        # Enrich outfits with shopping links and compute total sum
        for outfit in outfits:
            shopping_links = {}

            top_dict = outfit.get("top")
            top_cost = _parse_cost(top_dict.get("estimated_cost") if isinstance(top_dict, dict) else 0)

            bottom_dict = outfit.get("bottom")
            bottom_cost = _parse_cost(bottom_dict.get("estimated_cost") if isinstance(bottom_dict, dict) else 0)

            footwear_dict = outfit.get("footwear")
            footwear_cost = _parse_cost(footwear_dict.get("estimated_cost") if isinstance(footwear_dict, dict) else 0)

            accessories_list = outfit.get("accessories")
            acc_cost = 0
            if isinstance(accessories_list, list):
                for acc in accessories_list:
                    if isinstance(acc, dict):
                        acc_cost += _parse_cost(acc.get("estimated_cost"))

            total_cost = top_cost + bottom_cost + footwear_cost + acc_cost

            if total_cost > 0:
                outfit["estimated_cost"] = total_cost
            else:
                outfit["estimated_cost"] = _parse_cost(outfit.get("estimated_cost") or budget)

            # Build links for each component using parsed budgets
            if isinstance(top_dict, dict) and top_dict.get("search_query"):
                top_links = build_shopping_links(
                    top_dict["search_query"],
                    gender=gender,
                    occasion=occasion,
                    budget=_parse_cost(top_dict.get("estimated_cost"))
                )
                top_dict["shopping_links"] = top_links
                shopping_links["Top"] = top_links

            if isinstance(bottom_dict, dict) and bottom_dict.get("search_query"):
                bottom_links = build_shopping_links(
                    bottom_dict["search_query"],
                    gender=gender,
                    occasion=occasion,
                    budget=_parse_cost(bottom_dict.get("estimated_cost"))
                )
                bottom_dict["shopping_links"] = bottom_links
                shopping_links["Bottom"] = bottom_links

            if isinstance(footwear_dict, dict) and footwear_dict.get("search_query"):
                footwear_links = build_shopping_links(
                    footwear_dict["search_query"],
                    gender=gender,
                    occasion=occasion,
                    budget=_parse_cost(footwear_dict.get("estimated_cost"))
                )
                footwear_dict["shopping_links"] = footwear_links
                shopping_links["Footwear"] = footwear_links

            acc_links_list = []
            if isinstance(accessories_list, list):
                for acc in accessories_list:
                    if isinstance(acc, dict) and acc.get("search_query"):
                        acc_links = build_shopping_links(
                            acc["search_query"],
                            gender=gender,
                            occasion=occasion,
                            budget=_parse_cost(acc.get("estimated_cost"))
                        )
                        acc["shopping_links"] = acc_links
                        acc_links_list.append(acc_links)

            if acc_links_list:
                shopping_links["Accessory"] = acc_links_list[0]

            outfit["shopping_links"] = shopping_links

        # Save to recommendation history
        rec_id = save_recommendation(user_id, {
            "skin_tone": skin_tone,
            "skin_hex": skin_hex,
            "gender": gender,
            "occasion": occasion,
            "age": age,
            "budget": budget,
            "outfits": outfits,
            "color_palette": color_palette,
            "overall_advice": ai_data.get("overall_advice", "")
        })

        # Track preference for personalization
        preference_tag = f"{occasion} {gender}"
        add_past_preference(user_id, preference_tag)

        return jsonify({
            "session_id": rec_id,
            "skin_tone": skin_tone,
            "outfits": outfits,
            "color_palette": color_palette,
            "overall_advice": ai_data.get("overall_advice", ""),
            "generated_for": {
                "gender": gender,
                "occasion": occasion,
                "age": age,
                "budget": budget
            }
        }), 200
    except Exception as e:
        tb = traceback.format_exc()
        print("Error in generate_outfit:")
        print(tb)
        return jsonify({"error": "Internal Server Error", "details": str(e), "traceback": tb}), 500


@outfit_bp.route("/save", methods=["POST"])
@jwt_required_custom
def save_outfit_route():
    """Save an outfit to user favorites."""
    user_id = get_current_user_id()
    data = request.get_json()
    outfit = data.get("outfit")

    if not outfit:
        return jsonify({"error": "No outfit data provided"}), 400

    success = save_outfit(user_id, outfit)
    if success:
        return jsonify({"message": "Outfit saved successfully"}), 200
    return jsonify({"error": "Could not save outfit"}), 500


@outfit_bp.route("/saved", methods=["GET"])
@jwt_required_custom
def get_saved():
    """Get user's saved outfits."""
    user_id = get_current_user_id()
    outfits = get_saved_outfits(user_id)
    return jsonify({"saved_outfits": outfits}), 200


@outfit_bp.route("/saved/<outfit_name>", methods=["DELETE"])
@jwt_required_custom
def delete_saved_outfit(outfit_name):
    """Remove an outfit from saved."""
    user_id = get_current_user_id()
    success = remove_saved_outfit(user_id, outfit_name)
    if success:
        return jsonify({"message": "Outfit removed"}), 200
    return jsonify({"error": "Outfit not found"}), 404
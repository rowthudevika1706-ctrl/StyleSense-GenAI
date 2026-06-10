from groq import Groq
from dotenv import load_dotenv
import os
import json
import re
from urllib.parse import quote, quote_plus

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def _call_groq_with_fallback(messages, temperature=0.7, max_tokens=1500, response_format=None):
    """Call Groq API with prioritized fallback models to handle rate limits or outages."""
    models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "qwen/qwen3-32b"]
    last_err = None
    for model in models:
        try:
            print(f"Attempting Groq API call with model: {model}")
            kwargs = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            if response_format:
                kwargs["response_format"] = response_format
            response = client.chat.completions.create(**kwargs)
            return response
        except Exception as e:
            last_err = e
            print(f"Groq API call failed for model {model}: {e}")
            continue
    raise last_err if last_err else Exception("No Groq models succeeded")

SYSTEM_PROMPT = """You are StyleSense AI, a friendly and knowledgeable fashion stylist chatbot.

You are STRICTLY a fashion and styling assistant.

You may answer ONLY questions related to:
- Fashion
- Clothing
- Outfits
- Styling advice
- Color combinations
- Accessories
- Footwear
- Fashion trends
- Wardrobe planning
- Seasonal wear
- Occasion-based dressing
- Skin tone and color matching
- Grooming and appearance related to fashion

If the user asks anything unrelated to fashion, clothing, styling, appearance, or shopping for fashion items, DO NOT answer the question.

Instead reply exactly:

"Sorry, I can only assist with fashion, clothing, outfit recommendations, styling advice, accessories, and related topics."

Keep fashion-related responses concise, practical, and personalized.
Reference Indian fashion context when relevant.
"""


def generate_outfit_recommendations(
    skin_tone: str,
    gender: str,
    occasion: str,
    budget: int,
    age: int = None,
    past_preferences: list = None,
    color_palette: dict = None
) -> dict:
    """Generate AI outfit recommendations using Groq Llama 3.3."""

    past_prefs_text = ""
    if past_preferences:
        past_prefs_text = f"Past preferences & liked styles: {', '.join(past_preferences[:5])}"

    palette_text = ""
    if color_palette:
        primary_colors = color_palette.get('primary', [])
        color_names_map = color_palette.get('color_names', {})
        named_colors = [f"{color_names_map.get(c, c)} ({c})" for c in primary_colors]
        palette_text = f"Recommended colors for this skin tone: {', '.join(named_colors)}"

    age_text = ""
    age_group_style = "modern and versatile styles"
    if age:
        try:
            age_val = int(age)
            if 13 <= age_val <= 19:
                age_group_style = "youthful and trendy styles"
            elif 20 <= age_val <= 35:
                age_group_style = "modern and versatile styles"
            elif age_val > 35:
                age_group_style = "polished and refined styles"
            age_text = f"- Age: {age_val} years (Style signal: {age_group_style})"
        except (ValueError, TypeError):
            pass

    prompt = f"""Generate 3 complete outfit recommendations for:
- Skin Tone: {skin_tone}
- Gender: {gender}
- Occasion: {occasion}
{age_text}
- Total Budget: ₹{budget} INR
{past_prefs_text}
{palette_text}

The total budget of ₹{budget} INR is for the ENTIRE outfit. You must intelligently allocate this budget among: Top, Bottom, Footwear, and Accessories.
Ensure the sum of estimated costs for all components (Top + Bottom + Footwear + Accessories) is less than or equal to the total budget of ₹{budget} INR.

CRITICAL STYLING & COMBINATION RULES (MUST FOLLOW STRICTLY):
1. **Blouse Usage Rules**:
   - A blouse should ONLY be recommended when paired with a saree or another traditional draped outfit (like a lehenga or choli) that genuinely requires a blouse.
   - NEVER recommend a blouse for casual, college, office, party, or western-style outfits.
   - **NEVER use the word "blouse" (e.g. "silk blouse", "chiffon blouse") in the item name, color, material, or search query for any casual, college, office, party, formal, or western outfit. Use alternative terms like "shirt", "formal top", "button-down shirt", "silk shirt", or "elegant top" instead. The word "blouse" is reserved EXCLUSIVELY for traditional draped sarees or lehengas.**
   - DO NOT generate invalid combinations such as: blouse + skirt, blouse + jeans, blouse + shorts, blouse + cargo pants, or blouse + trousers (unless part of a traditional draped ensemble).
2. **Preferred Women's Western Tops**:
   - For non-traditional outfits, recommend appropriate tops such as: short tops, peplum tops, T-shirts, crop tops, tunics, casual shirts, elegant office tops, or sweaters/knitwear (when appropriate).
3. **Ensure Logical Pairings**:
   - Only generate pairings that people realistically wear, e.g., T-shirt + Jeans, Short Top + Wide-leg Pants, Peplum Top + Trousers, Crop Top + Cargo Pants, Shirt + Trousers, Top + Midi Skirt, Kurti + Leggings, Kurti + Palazzo Pants, Saree + Matching Blouse, Lehenga + Choli. Every outfit must be internally consistent.
4. **Occasion-Specific Guidance**:
   - Casual: T-shirts, short tops, peplum tops, jeans, joggers, casual dresses, sneakers.
   - College: Trendy tops, jeans, cargo pants, comfortable footwear, kurtis.
   - Office: Shirts, elegant tops, trousers, formal skirts, blazers, loafers.
   - Party: Stylish dresses, coordinated tops & skirts, jumpsuits, heels, statement accessories.
   - Wedding: Sarees with matching blouses, lehengas, salwar suits, gowns, festive wear.
   - Formal: Structured shirts, trousers, blazers, formal dresses, polished footwear.

For each outfit:
1. Dynamically infer a suitable styling preference based on the user's age, gender, occasion, and total budget.
2. Select at least one dominant color from the recommended color palette for the main components.
3. Each clothing component must have an estimated cost and a search query.
4. Create highly optimized search queries for each component. The query MUST strictly follow this format:
   `{{color}} {{material/fabric or style description}} {{item type}} for {{gender_noun}} under ₹{{component_budget}}` (optionally append occasion/age group details, e.g., 'beige cotton kurti for women under ₹800 for college wear' or 'light grey high waisted skirt for women under ₹900 suitable for young adults').
   Use the component's individual allocated budget in the query (under ₹{{component_budget}}), NOT the overall budget.

Return ONLY a JSON object with this exact structure:
{{
  "outfits": [
    {{
      "id": 1,
      "name": "Outfit name",
      "budget_tier": "Budget-Friendly|Balanced|Premium",
      "why_it_works": "Explanation of why this suits their skin tone, occasion, and age",
      "top": {{
        "item": "Item description",
        "color": "Color name",
        "material": "Fabric type",
        "estimated_cost": 500,
        "search_query": "Optimized search query, e.g., 'beige cotton kurti for women under ₹500 for college wear'"
      }},
      "bottom": {{
        "item": "Item description",
        "color": "Color name",
        "material": "Fabric type",
        "estimated_cost": 600,
        "search_query": "Optimized search query, e.g., 'light grey high waisted skirt for women under ₹600 suitable for young adults'"
      }},
      "footwear": {{
        "item": "Item description",
        "color": "Color name",
        "estimated_cost": 600,
        "search_query": "Optimized search query, e.g., 'cream sneakers under ₹600'"
      }},
      "accessories": [
        {{
          "item": "Item description",
          "estimated_cost": 300,
          "search_query": "Optimized search query, e.g., 'minimal silver earrings under ₹300'"
        }}
      ],
      "hairstyle": "Hairstyle suggestion",
      "color_story": "How colors work together",
      "styling_tips": ["tip1", "tip2"]
    }}
  ],
  "overall_advice": "General styling advice for this person"
}}"""

    try:
        response = _call_groq_with_fallback(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content.strip()

        # Strip markdown code fences if present
        content = re.sub(r"^```json\s*", "", content)
        content = re.sub(r"^```\s*", "", content)
        content = re.sub(r"\s*```$", "", content)

        data = json.loads(content)
        return {"success": True, "data": data}

    except json.JSONDecodeError as e:
        return {"success": False, "error": f"JSON parse error: {str(e)}", "raw": content}
    except Exception as e:
        return {"success": False, "error": str(e)}


def is_fashion_related(text: str) -> bool:
    """Classify if the input text is related to fashion/styling."""
    prompt = f"""You are a strict binary classifier for a fashion AI assistant.
Determine if the following text is related to fashion, clothing, styling, outfits, seasonal trends, ethnic/formal/casual/sports wear, accessories, shopping for fashion, color matching, body type styling, or grooming/appearance.
If the text is related to these topics, respond with the JSON object: {{"is_fashion": true}}
If the text is NOT related (e.g. programming, politics, sports, general math, science, recipe, general chatting unrelated to styling), respond with: {{"is_fashion": false}}

Text: "{text}"
"""
    try:
        response = _call_groq_with_fallback(
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.0,
            max_tokens=20,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content.strip()
        data = json.loads(content)
        return bool(data.get("is_fashion", False))
    except Exception as e:
        print(f"Error in is_fashion_related validation: {e}")
        keywords = [
            "wear", "dress", "shirt", "pant", "shoe", "accessory", "fashion", "style", "color", "outfit",
            "brand", "look", "casual", "formal", "ethnic", "trend", "suit", "jacket", "jeans", "tshirt",
            "sari", "kurta", "wedding", "party", "skirt", "sneaker", "boot", "watch", "belt", "hat",
            "glass", "complexion", "skin", "undertone", "combination", "styling"
        ]
        text_lower = text.lower()
        return any(k in text_lower for k in keywords)


def generate_chat_response(
    user_message: str,
    user_profile: dict,
    conversation_history: list = None
) -> str:
    """Generate a fashion chatbot response."""

    system = f"""You are StyleSense AI, a friendly and knowledgeable fashion stylist chatbot.
User Profile:
- Skin Tone: {user_profile.get('skin_tone', 'Medium')}
- Gender: {user_profile.get('gender', 'Not specified')}
- Age: {user_profile.get('age', 'Not specified')}
- Typical Occasions: {user_profile.get('occasion', 'Casual')}
- Budget Range: ₹{user_profile.get('budget', 2000)} INR

Give personalized, practical fashion advice. Be warm, encouraging, and specific.
Reference Indian fashion context when relevant. Keep responses concise but helpful.

IMPORTANT WRITING & STYLE RULES:
- DO NOT use markdown bold formatting (do not enclose words/phrases in double asterisks like **text**).
- DO NOT use any asterisks (*) for formatting. If you want to use bulleted lists, use simple hyphens (-) or numbers (1., 2.).
- Write in a natural, conversational, and helper-oriented voice, just like a human personal shopper or stylist messaging the user directly."""

    messages = [{"role": "system", "content": system}]

    if conversation_history:
        messages.extend(conversation_history[-6:])

    messages.append({"role": "user", "content": user_message})

    try:
        response = _call_groq_with_fallback(
            messages=messages,
            temperature=0.8,
            max_tokens=600
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"I'm having trouble connecting right now. Please try again! Error: {str(e)}"


def generate_product_search_queries(outfit: dict) -> list:
    """Extract shopping search queries from an outfit recommendation."""
    queries = []
    if outfit.get("top"):
        queries.append({
            "part": "Top",
            "query": outfit["top"].get("search_query", ""),
            "budget": outfit["top"].get("estimated_cost")
        })
    if outfit.get("bottom"):
        queries.append({
            "part": "Bottom",
            "query": outfit["bottom"].get("search_query", ""),
            "budget": outfit["bottom"].get("estimated_cost")
        })
    if outfit.get("footwear"):
        queries.append({
            "part": "Footwear",
            "query": outfit["footwear"].get("search_query", ""),
            "budget": outfit["footwear"].get("estimated_cost")
        })
    for acc in outfit.get("accessories", []):
        queries.append({
            "part": "Accessory",
            "query": acc.get("search_query", ""),
            "budget": acc.get("estimated_cost"),
            "item_name": acc.get("item", "")
        })
    return queries


def _normalize_gender_search_term(gender: str) -> str:
    gender = (gender or "").strip().lower()
    if "male" in gender and "female" not in gender:
        return "men's"
    if "female" in gender and "male" not in gender:
        return "women's"
    if "unisex" in gender:
        return "unisex"
    if "non-binary" in gender or "non binary" in gender or gender == "nb":
        return "gender neutral"
    return gender


def build_shopping_links(search_query: str, gender: str = None, occasion: str = None, budget: int = None) -> dict:
    """Build direct shopping links for major Indian e-commerce platforms with gender, occasion, and budget context."""
    if not search_query:
        return {}

    search_query = search_query.strip()
    contextual_terms = [search_query]

    gender_term = _normalize_gender_search_term(gender)
    if gender_term and gender_term not in search_query.lower():
        contextual_terms.append(gender_term)

    if occasion:
        occasion_text = occasion.strip().lower()
        if occasion_text not in search_query.lower():
            contextual_terms.append(f"for {occasion_text}")

    if budget:
        budget_text = f"under ₹{budget}"
        if budget_text not in search_query.lower():
            contextual_terms.append(budget_text)

    contextual_query = " ".join(contextual_terms)
    encoded = quote_plus(contextual_query)
    myntra_path = quote(contextual_query.replace(" ", "-"), safe="-")

    return {
        "amazon": f"https://www.amazon.in/s?k={encoded}",
        "myntra": f"https://www.myntra.com/{myntra_path}",
        "ajio": f"https://www.ajio.com/search/?text={encoded}",
        "flipkart": f"https://www.flipkart.com/search?q={encoded}"
    }


def generate_build_around_recommendations(
    gender: str,
    occasion: str,
    budget: int,
    base_item_name: str,
    selected_categories: list,
    budget_allocations: dict,
    detected_color: str = None,
    detected_pattern: str = None,
    age: int = None,
    color_palette: dict = None,
    skin_tone: str = None
) -> dict:
    """
    Generate outfit recommendations built around a base item the user owns.
    """
    # Setup prompt parameters
    base_desc = base_item_name or "uploaded clothing item"
    if detected_color and detected_color.lower() not in base_desc.lower():
        base_desc = f"{detected_color} {base_desc}"
    if detected_pattern and detected_pattern != "solid" and detected_pattern.lower() not in base_desc.lower():
        base_desc = f"{detected_pattern} {base_desc}"

    # Setup allocations text
    allocations_list = [f"- {cat}: ₹{amt} INR" for cat, amt in budget_allocations.items()]
    budget_allocation_text = "\n".join(allocations_list)

    age_text = ""
    if age:
        age_text = f"- Age: {age} years"

    palette_text = ""
    if color_palette:
        primary_colors = color_palette.get('primary', [])
        color_names_map = color_palette.get('color_names', {})
        named_colors = [f"{color_names_map.get(c, c)} ({c})" for c in primary_colors]
        palette_text = f"Recommended colors for matching: {', '.join(named_colors)}"

    # We need to map selected categories to top, bottom, footwear, accessories inside LLM instructions
    prompt = f"""Generate 3 coordinated outfit recommendation options, each building around the user's owned base item.

Base Item: {base_desc}
Skin Tone: {skin_tone or 'Medium'}
Gender: {gender}
Occasion: {occasion}
{age_text}
Total Budget for recommended items: ₹{budget} INR
{palette_text}

We have automatically pre-allocated the budget among the following complementary categories that the user requested:
{budget_allocation_text}

For each of the 3 outfit options:
1. Recommend matching items for EXACTLY the selected categories: {", ".join(selected_categories)}.
2. Select colors for the recommended items that coordinate beautifully with the base item ({base_desc}).
3. For each recommended category, create a clothing component containing:
   - `item`: Description of the item.
   - `color`: Color name.
   - `material`: Fabric/material type.
   - `estimated_cost`: The pre-allocated cost for this category.
   - `search_query`: Highly optimized search query. The query MUST strictly follow this format:
     `{{color}} {{material/fabric or style description}} {{item type}} for {{gender_noun}} under ₹{{component_budget}}` (optionally append occasion/age group details, e.g., 'grey slim fit chinos for men under ₹1200 for casual wear').
     Use the component's individual allocated budget in the query (under ₹{{component_budget}}).

CRITICAL STYLING & COMBINATION RULES (MUST FOLLOW STRICTLY):
- Use the word "blouse" ONLY when paired with traditional sarees or lehengas. NEVER use the word "blouse" for casual or western outfits.
- Ensure the recommendations coordinate with the base item: {base_desc}.

Return ONLY a JSON object with this exact structure:
{{
  "outfits": [
    {{
      "id": 1,
      "name": "Outfit option name (e.g. Smart Casual Blazer Look)",
      "budget_tier": "Budget-Friendly|Balanced|Premium",
      "why_it_works": "Detailed explanation of how these recommended items complement the base item ({base_desc}) and suit the user's skin tone ({skin_tone or 'Medium'}) in terms of color palette, style, pattern, and occasion suitability.",
      "base_item": {{
        "item": "{base_item_name or 'Owned Base Item'}",
        "color": "{detected_color or 'Matching'}",
        "pattern": "{detected_pattern or 'solid'}"
      }},
      # ONLY include the recommended components here!
      # Map them to the correct keys:
      # - "top" (for Tops, Shirts, Jackets, Shrugs)
      # - "bottom" (for Pants, Jeans, Trousers, Skirts)
      # - "footwear" (for Shoes, Footwear)
      # - "accessories" (list of dicts, for Watches, Bags, Belts, Sunglasses, Jewellery, Accessories)
      # Do not output empty/null fields for categories that were NOT selected.
      "top": {{
        "item": "Item description",
        "color": "Color name",
        "material": "Fabric type",
        "estimated_cost": 1000,
        "search_query": "search query under ₹1000"
      }},
      "bottom": {{
        "item": "Item description",
        "color": "Color name",
        "material": "Fabric type",
        "estimated_cost": 1200,
        "search_query": "search query under ₹1200"
      }},
      "footwear": {{
        "item": "Item description",
        "color": "Color name",
        "estimated_cost": 1500,
        "search_query": "search query under ₹1500"
      }},
      "accessories": [
        {{
          "item": "Item description",
          "estimated_cost": 500,
          "search_query": "search query under ₹500"
        }}
      ],
      "hairstyle": "Hairstyle suggestion",
      "color_story": "How the colors coordinate with the base item",
      "styling_tips": ["tip1", "tip2"]
    }}
  ],
  "overall_advice": "General advice on how to style the base item ({base_desc}) for different settings"
}}"""

    SYSTEM_PROMPT_BUILD = """You are StyleSense AI, a friendly and knowledgeable fashion stylist chatbot.
You specialize in styling outfit recommendations built around a base item that the user already owns.
Ensure the recommendations are coordinated, trend-aware, occasion-appropriate, and complement the base item in color, style, pattern, and aesthetic."""

    try:
        response = _call_groq_with_fallback(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_BUILD},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content.strip()

        # Strip markdown code fences if present
        content = re.sub(r"^```json\s*", "", content)
        content = re.sub(r"^```\s*", "", content)
        content = re.sub(r"\s*```$", "", content)

        data = json.loads(content)
        return {"success": True, "data": data}

    except json.JSONDecodeError as e:
        return {"success": False, "error": f"JSON parse error: {str(e)}", "raw": content}
    except Exception as e:
        return {"success": False, "error": str(e)}


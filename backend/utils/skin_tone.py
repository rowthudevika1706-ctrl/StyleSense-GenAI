import cv2
import numpy as np
import io
import base64
from PIL import Image

try:
    import mediapipe as mp
    mp_face_mesh = mp.solutions.face_mesh
except (ImportError, AttributeError):
    mp = None
    mp_face_mesh = None

# Skin tone landmark indices for forehead / cheek regions
FACE_SKIN_LANDMARKS = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323,
                        361, 288, 397, 365, 379, 378, 400, 377, 152, 148,
                        176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
                        162, 21, 54, 103, 67, 109]

def decode_image(image_data: str) -> np.ndarray:
    """Decode base64 image to numpy array."""
    if "," in image_data:
        image_data = image_data.split(",")[1]
    img_bytes = base64.b64decode(image_data)
    img_array = np.frombuffer(img_bytes, dtype=np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    return img

def detect_skin_tone(image_data: str) -> dict:
    """
    Detect skin tone from a base64 encoded image.
    Returns skin tone category and detected RGB values.
    """
    try:
        img = decode_image(image_data)
        if img is None:
            return {"error": "Could not decode image", "skin_tone": "Medium"}

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        h, w = img_rgb.shape[:2]

        if mp_face_mesh is None:
            return _fallback_skin_detection(img_rgb)

        with mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        ) as face_mesh:
            results = face_mesh.process(img_rgb)

            if not results.multi_face_landmarks:
                # Fallback: sample center region of image
                return _fallback_skin_detection(img_rgb)

            face_landmarks = results.multi_face_landmarks[0]
            skin_pixels = []

            for idx in FACE_SKIN_LANDMARKS:
                if idx < len(face_landmarks.landmark):
                    lm = face_landmarks.landmark[idx]
                    x = min(int(lm.x * w), w - 1)
                    y = min(int(lm.y * h), h - 1)
                    pixel = img_rgb[y, x]
                    skin_pixels.append(pixel)

            if not skin_pixels:
                return _fallback_skin_detection(img_rgb)

            skin_pixels = np.array(skin_pixels, dtype=np.float32)
            avg_color = skin_pixels.mean(axis=0)
            r, g, b = int(avg_color[0]), int(avg_color[1]), int(avg_color[2])

            skin_tone = classify_skin_tone(r, g, b)

            return {
                "skin_tone": skin_tone,
                "rgb": {"r": r, "g": g, "b": b},
                "hex": f"#{r:02x}{g:02x}{b:02x}",
                "detected": True
            }

    except Exception as e:
        return {
            "error": str(e),
            "skin_tone": "Medium",
            "rgb": {"r": 180, "g": 140, "b": 110},
            "hex": "#b48c6e",
            "detected": False
        }


def _fallback_skin_detection(img_rgb: np.ndarray) -> dict:
    """Sample the center region as fallback."""
    h, w = img_rgb.shape[:2]
    cy, cx = h // 2, w // 2
    region = img_rgb[cy-30:cy+30, cx-30:cx+30]
    avg_color = region.reshape(-1, 3).mean(axis=0)
    r, g, b = int(avg_color[0]), int(avg_color[1]), int(avg_color[2])
    skin_tone = classify_skin_tone(r, g, b)
    return {
        "skin_tone": skin_tone,
        "rgb": {"r": r, "g": g, "b": b},
        "hex": f"#{r:02x}{g:02x}{b:02x}",
        "detected": True
    }


def classify_skin_tone(r: int, g: int, b: int) -> str:
    """
    Classify skin tone based on RGB values using ITA (Individual Typology Angle).
    ITA = arctan((L* - 50) / b*) * 180 / pi
    """
    # Convert to LAB for better skin tone analysis
    rgb_pixel = np.uint8([[[r, g, b]]])
    lab_pixel = cv2.cvtColor(rgb_pixel, cv2.COLOR_RGB2LAB)[0][0]
    L, a, b_val = float(lab_pixel[0]), float(lab_pixel[1]), float(lab_pixel[2])

    # Normalize LAB values
    L_norm = L * 100.0 / 255.0
    b_norm = b_val - 128.0

    # ITA angle calculation
    if b_norm == 0:
        b_norm = 0.001
    ita = np.arctan((L_norm - 50) / b_norm) * (180 / np.pi)

    # Classification based on ITA ranges
    if ita > 55:
        return "Fair"
    elif ita > 41:
        return "Light"
    elif ita > 28:
        return "Medium"
    elif ita > 10:
        return "Olive"
    elif ita > -30:
        return "Tan"
    else:
        return "Deep"


def get_color_palette(skin_tone: str) -> dict:
    """Return recommended color palette based on skin tone."""
    palettes = {
        "Fair": {
            "primary": ["#C8A2C8", "#7B9EA8", "#E8B4B8", "#A8B5C8"],
            "secondary": ["#F5E6D3", "#D4E6C3", "#E8D5C4", "#C8D4E0"],
            "accent": ["#8B4513", "#2E4A6B", "#6B4226", "#4A6741"],
            "color_names": {
                "#C8A2C8": "Lilac", "#7B9EA8": "Steel Blue", "#E8B4B8": "Rose Dust", "#A8B5C8": "Slate Gray",
                "#F5E6D3": "Beige", "#D4E6C3": "Sage Green", "#E8D5C4": "Sand", "#C8D4E0": "Periwinkle",
                "#8B4513": "Saddle Brown", "#2E4A6B": "Navy Blue", "#6B4226": "Chocolate", "#4A6741": "Forest Green"
            },
            "avoid": ["#FF6600", "#FFD700"],
            "description": "Soft, cool, and muted tones complement fair skin beautifully."
        },
        "Light": {
            "primary": ["#E8A87C", "#7FCDCD", "#B5C4B1", "#D4A5A5"],
            "secondary": ["#F0E6D3", "#E0EDE0", "#F5D5C8", "#D8E8F0"],
            "accent": ["#C04000", "#1A5276", "#7D3C98", "#1E8449"],
            "color_names": {
                "#E8A87C": "Peach", "#7FCDCD": "Turquoise", "#B5C4B1": "Sage", "#D4A5A5": "Dusty Rose",
                "#F0E6D3": "Cream", "#E0EDE0": "Mint", "#F5D5C8": "Soft Coral", "#D8E8F0": "Sky Blue",
                "#C04000": "Mahogany", "#1A5276": "Ocean Blue", "#7D3C98": "Purple", "#1E8449": "Emerald"
            },
            "avoid": ["#FFFF00", "#FFA500"],
            "description": "Warm earth tones and rich jewel tones enhance light skin."
        },
        "Medium": {
            "primary": ["#E8760A", "#C0392B", "#1A5276", "#1E8449"],
            "secondary": ["#F8C471", "#AED6F1", "#A9DFBF", "#F1948A"],
            "accent": ["#784212", "#154360", "#512E5F", "#145A32"],
            "color_names": {
                "#E8760A": "Burnt Orange", "#C0392B": "Crimson", "#1A5276": "Teal Blue", "#1E8449": "Forest Green",
                "#F8C471": "Sand / Mustard", "#AED6F1": "Light Blue", "#A9DFBF": "Light Sage", "#F1948A": "Salmon",
                "#784212": "Brown", "#154360": "Dark Navy", "#512E5F": "Deep Purple", "#145A32": "Olive Green"
            },
            "avoid": ["#F0E68C", "#FFFACD"],
            "description": "Bold, warm colors and deep jewel tones are perfect for medium skin."
        },
        "Olive": {
            "primary": ["#C0392B", "#8E44AD", "#E67E22", "#16A085"],
            "secondary": ["#F8C471", "#D7BDE2", "#A3E4D7", "#FAD7A0"],
            "accent": ["#922B21", "#6C3483", "#B7770D", "#0E6655"],
            "color_names": {
                "#C0392B": "Rust Red", "#8E44AD": "Amethyst", "#E67E22": "Warm Orange", "#16A085": "Teal",
                "#F8C471": "Mustard", "#D7BDE2": "Lavender", "#A3E4D7": "Pale Green", "#FAD7A0": "Peach",
                "#922B21": "Burgundy", "#6C3483": "Deep Violet", "#B7770D": "Ochre", "#0E6655": "Dark Emerald"
            },
            "avoid": ["#A9A9A9", "#808080"],
            "description": "Rich, warm, and earthy tones beautifully complement olive skin."
        },
        "Tan": {
            "primary": ["#E74C3C", "#F39C12", "#1ABC9C", "#8E44AD"],
            "secondary": ["#FADBD8", "#FDEBD0", "#D1F2EB", "#E8DAEF"],
            "accent": ["#922B21", "#9A7D0A", "#0B5345", "#5B2C6F"],
            "color_names": {
                "#E74C3C": "Coral Red", "#F39C12": "Honey Gold", "#1ABC9C": "Turquoise", "#8E44AD": "Royal Purple",
                "#FADBD8": "Blush Pink", "#FDEBD0": "Parchment", "#D1F2EB": "Mint Green", "#E8DAEF": "Lilac",
                "#922B21": "Crimson", "#9A7D0A": "Mustard", "#0B5345": "Deep Teal", "#5B2C6F": "Plum"
            },
            "avoid": ["#D2B48C", "#F5DEB3"],
            "description": "Vibrant, warm colors and deep tones create stunning contrast with tan skin."
        },
        "Deep": {
            "primary": ["#F39C12", "#E74C3C", "#1ABC9C", "#F8F9FA"],
            "secondary": ["#FEF9E7", "#FDEDEC", "#E8F8F5", "#FDFEFE"],
            "accent": ["#D4AC0D", "#CB4335", "#148F77", "#BFC9CA"],
            "color_names": {
                "#F39C12": "Tangerine", "#E74C3C": "Fire Red", "#1ABC9C": "Teal", "#F8F9FA": "Crisp White",
                "#FEF9E7": "Ivory", "#FDEDEC": "Pale Pink", "#E8F8F5": "Pale Turquoise", "#FDFEFE": "White",
                "#D4AC0D": "Gold", "#CB4335": "Bright Red", "#148F77": "Pine Green", "#BFC9CA": "Silver"
            },
            "avoid": ["#4A235A", "#1B2631"],
            "description": "Bright, vivid colors and whites create beautiful contrast with deep skin."
        }
    }
    return palettes.get(skin_tone, palettes["Medium"])
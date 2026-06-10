import cv2
import numpy as np
import base64

BASIC_COLORS = {
    "Red": (255, 0, 0),
    "Blue": (0, 0, 255),
    "Green": (0, 128, 0),
    "Yellow": (255, 255, 0),
    "Orange": (255, 165, 0),
    "Purple": (128, 0, 128),
    "Pink": (255, 192, 203),
    "Brown": (139, 69, 19),
    "Black": (0, 0, 0),
    "White": (255, 255, 255),
    "Grey": (128, 128, 128),
    "Beige": (245, 245, 220),
    "Navy Blue": (0, 0, 128),
    "Olive Green": (128, 128, 0),
    "Maroon": (128, 0, 0),
    "Teal": (0, 128, 128),
    "Mustard": (227, 180, 72),
    "Cream": (253, 253, 235),
    "Peach": (255, 218, 185),
    "Coral": (255, 127, 80),
    "Burgundy": (128, 0, 32),
    "Turquoise": (64, 224, 208)
}

def get_closest_color_name(r, g, b):
    min_dist = float("inf")
    closest_name = "Unknown"
    for name, rgb in BASIC_COLORS.items():
        dist = (r - rgb[0])**2 + (g - rgb[1])**2 + (b - rgb[2])**2
        if dist < min_dist:
            min_dist = dist
            closest_name = name
    return closest_name

def analyze_clothing_image(image_data: str) -> dict:
    """
    Analyze clothing image to detect dominant color and pattern style.
    """
    try:
        # Decode base64
        if "," in image_data:
            image_data = image_data.split(",")[1]
        img_bytes = base64.b64decode(image_data)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"error": "Could not decode image"}
            
        # Resize to 100x100 for fast processing
        img_small = cv2.resize(img, (100, 100), interpolation=cv2.INTER_AREA)
        img_rgb = cv2.cvtColor(img_small, cv2.COLOR_BGR2RGB)
        
        # Flatten pixels
        pixels = img_rgb.reshape(-1, 3)
        
        # We want to ignore backgrounds that are very close to white or black
        filtered_pixels = []
        for p in pixels:
            r, g, b = p
            # skip white background
            if r > 240 and g > 240 and b > 240:
                continue
            # skip black background
            if r < 20 and g < 20 and b < 20:
                continue
            filtered_pixels.append(p)
            
        if not filtered_pixels:
            filtered_pixels = pixels  # Fallback to all pixels
            
        filtered_pixels = np.float32(filtered_pixels)
        
        # Perform KMeans clustering to find the dominant color
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
        flags = cv2.KMEANS_RANDOM_CENTERS
        n_clusters = min(2, len(filtered_pixels))
        if n_clusters > 1:
            compactness, labels, centers = cv2.kmeans(filtered_pixels, n_clusters, None, criteria, 10, flags)
            unique, counts = np.unique(labels, return_counts=True)
            dominant_idx = unique[np.argmax(counts)]
            dominant_rgb = centers[dominant_idx]
        else:
            dominant_rgb = np.mean(filtered_pixels, axis=0)
            
        r, g, b = int(dominant_rgb[0]), int(dominant_rgb[1]), int(dominant_rgb[2])
        color_hex = f"#{r:02x}{g:02x}{b:02x}"
        color_name = get_closest_color_name(r, g, b)
        
        # Pattern analysis using edge density
        gray = cv2.cvtColor(img_small, cv2.COLOR_RGB2GRAY)
        std_dev = np.std(gray)
        edges = cv2.Canny(gray, 30, 100)
        edge_density = np.sum(edges > 0) / (gray.shape[0] * gray.shape[1])
        
        pattern = "patterned" if (edge_density > 0.05 or std_dev > 45) else "solid"
        
        return {
            "success": True,
            "color_name": color_name,
            "color_hex": color_hex,
            "pattern": pattern,
            "rgb": {"r": r, "g": g, "b": b}
        }
    except Exception as e:
        return {"error": str(e)}

def allocate_budgets(total_budget: int, selected_categories: list) -> dict:
    """
    Allocates total budget dynamically across selected categories using relative pricing weights.
    """
    weights = {
        "shirts/t-shirts": 1.0,
        "tops/shirts": 1.0,
        "pants/jeans": 1.0,
        "jeans/trousers": 1.0,
        "skirt": 0.9,
        "shoes": 0.9,
        "footwear": 0.9,
        "watch": 0.65,
        "jacket": 1.1,
        "jacket/shrug": 1.0,
        "belt": 0.3,
        "bag": 0.7,
        "handbag": 0.8,
        "sunglasses": 0.4,
        "jewellery": 0.4,
        "accessories": 0.3,
        "kurtas": 1.0,
        "kurtis": 1.0,
        "kurtas/kurtis": 1.0,
        "palazzos": 0.9,
        "salwars": 0.8,
        "churidars": 0.8,
        "salwars/churidars": 0.8,
        "dupattas": 0.4,
        "lehengas": 1.6,
        "sarees": 1.5,
        "blouses": 0.8,
        "nehru jackets": 1.1,
        "sherwanis": 1.4,
        "ethnic jackets": 1.1,
        "anarkali suits": 1.3
    }
    
    if not selected_categories:
        return {}
        
    cat_weights = {}
    for cat in selected_categories:
        key = cat.lower().strip()
        cat_weights[cat] = weights.get(key, 0.5)
        
    total_weight = sum(cat_weights.values())
    if total_weight == 0:
        total_weight = 1.0
        
    allocations = {}
    remaining = total_budget
    
    # Sort categories to allocate smaller ones first, largest last
    sorted_cats = sorted(selected_categories, key=lambda c: cat_weights[c])
    
    for i, cat in enumerate(sorted_cats[:-1]):
        weight = cat_weights[cat]
        share = total_budget * (weight / total_weight)
        rounded_share = round(share / 100.0) * 100
        # Ensure minimum of 100 per category and leave room for remainder categories
        rounded_share = max(100, min(rounded_share, remaining - 100 * (len(sorted_cats) - i - 1)))
        allocations[cat] = rounded_share
        remaining -= rounded_share
        
    if sorted_cats:
        allocations[sorted_cats[-1]] = max(0, remaining)
        
    return allocations

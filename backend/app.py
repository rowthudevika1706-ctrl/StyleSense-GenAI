from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

from routes.auth import auth_bp
from routes.photo import photo_bp
from routes.outfit import outfit_bp
from routes.profile import profile_bp
from routes.chatbot import chatbot_bp
from routes.history import history_bp

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# JWT Configuration
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False
jwt = JWTManager(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(photo_bp, url_prefix="/api/photo")
app.register_blueprint(outfit_bp, url_prefix="/api/outfit")
app.register_blueprint(profile_bp, url_prefix="/api/profile")
app.register_blueprint(chatbot_bp, url_prefix="/api/chat")
app.register_blueprint(history_bp, url_prefix="/api/history")

@app.route("/api/health")
def health():
    return {"status": "ok", "message": "StyleSense AI is running"}

if __name__ == "__main__":
    # app.run(debug=os.getenv("FLASK_DEBUG", "0") == "1", port=5000)
    app.run(debug=True, port=5000)
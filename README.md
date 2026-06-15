# 👗 StyleSense – AI Personal Stylist & Outfit Recommendation Platform

StyleSense is an AI-powered fashion recommendation web application that helps users create stylish outfits based on their **skin tone, preferences, occasion, and budget**. Using **Computer Vision (OpenCV)** and **Large Language Models (Groq Llama)**, the platform provides personalized styling advice, coordinated outfit suggestions, and shopping recommendations.

## ✨ Features

* 🎨 **Skin Tone Detection** using facial image analysis
* 👕 **Complete Outfit Generation** based on user preferences
* 👖 **Build Around My Item** by recommending matching clothing and accessories
* 💬 **AI Style Chat Assistant** for fashion guidance and trend suggestions
* 💰 **Smart Budget Allocation** across outfit components
* 🛍️ **Shopping Links** for Amazon, Myntra, Ajio, and Flipkart
* ❤️ **Save Favorite Outfits** and view styling history
* 📱 Responsive and modern user interface with glassmorphism design

---

## 🚀 How It Works

### Mode 1 – Get Whole Outfit Styled

1. Upload a face image or select your skin tone.
2. Enter gender, age, occasion, and budget.
3. Receive AI-generated outfit recommendations with matching colors and shopping suggestions.

### Mode 2 – Build Around My Item

1. Upload or describe an existing clothing item.
2. Choose categories to match (pants, shoes, accessories, etc.).
3. Get coordinated outfit recommendations based on color, pattern, and budget.

---

## 🛠️ Tech Stack

### Frontend

* React.js (Vite)
* Vanilla CSS
* React Webcam
* Lucide React

### Backend

* Python
* Flask
* OpenCV
* PyMongo
* JWT Authentication
* Bcrypt

### AI & Database

* Groq LLM (Llama Models)
* MongoDB

---

## 🏗️ Project Architecture

```
React Frontend
        │
        ▼
 Flask REST API
        │
 ┌──────┴────────┐
 │               │
 ▼               ▼
OpenCV      Groq LLM
 │               │
 └──────┬────────┘
        ▼
     MongoDB
```

---

## 📂 Key Modules

### Backend

* User Authentication
* Outfit Recommendation Engine
* Image Analyzer
* AI Prompt Generation
* Budget Allocation Logic

### Frontend

* Styling Dashboard
* AI Chat Interface
* Outfit Cards
* Photo Upload Components
* User Profile & Saved Looks

---

## 🔧 Installation

### Clone the repository

```bash
git clone https://github.com/rowthudevika1706-ctrl/StyleSense-GenAI.git
cd StyleSense-GenAI
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📄 Project Report

Place your project report inside a `docs/` folder:

```
StyleSense.pdf
```

You can then access it directly from the repository.

---

## 🔮 Future Enhancements

* Virtual Try-On using Generative AI
* Wardrobe Analytics
* Community Styling Feed
* Advanced Personalization
* Multi-language Support

---

## 🎯 Conclusion

StyleSense combines Artificial Intelligence, Computer Vision, and modern web technologies to deliver personalized fashion recommendations. By analyzing user preferences, skin tone, and budget, it helps users confidently discover coordinated outfits and make smarter styling decisions.

---

## 👩‍💻 Authors

Developed as a full-stack AI fashion recommendation project using React, Flask, OpenCV, Groq LLM, and MongoDB.

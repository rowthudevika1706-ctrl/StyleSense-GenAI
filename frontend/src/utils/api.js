import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("stylesense_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("stylesense_token");
      localStorage.removeItem("stylesense_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// Photo & Skin Tone
export const photoAPI = {
  analyze: (imageBase64) => api.post("/photo/analyze", { image: imageBase64 }),
};

// Profile
export const profileAPI = {
  get: () => api.get("/profile/"),
  update: (data) => api.put("/profile/update", data),
  options: () => api.get("/profile/options"),
};

// Outfits
export const outfitAPI = {
  generate: (data) => api.post("/outfit/generate", data),
  save: (outfit) => api.post("/outfit/save", { outfit }),
  getSaved: () => api.get("/outfit/saved"),
  deleteSaved: (name) => api.delete(`/outfit/saved/${encodeURIComponent(name)}`),
};

// Chatbot
export const chatAPI = {
  message: (message, history) => api.post("/chat/message", { message, history }),
  getHistory: (search = "") => api.get(`/chat/history?search=${encodeURIComponent(search)}`),
};


// History
export const historyAPI = {
  getAll: (limit = 20) => api.get(`/history/?limit=${limit}`),
  getOne: (id) => api.get(`/history/${id}`),
};

export default api;
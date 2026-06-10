import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Sparkles, ArrowRight, UserCheck, Shield, ShoppingBag, Menu, X, 
  Sun, Moon, CheckCircle, Shirt, Palette, TrendingUp, Heart, Compass
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  {
    title: "Casual",
    description: "Everyday comfort with effortless, cool styles for coffee runs or weekend hangouts.",
    image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Formal",
    description: "Sharp, professional, and tailored looks that command respect in boardrooms.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Ethnic",
    description: "Traditional Indian wear with modern elegance for weddings, festivals, and family events.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Sports",
    description: "High-performance athleisure and activewear combining mobility with contemporary aesthetics.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Streetwear",
    description: "Edgy, bold designs inspired by urban culture, featuring oversized hoodies and sneakers.",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Party Wear",
    description: "Showstopping evening ensembles, cocktail dresses, and blazers to light up any night.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80"
  }
];

const STEPS = [
  {
    step: "01",
    title: "Upload Your Image",
    icon: Sparkles,
    description: "Upload a photo of yourself for intelligent skin tone and facial contrast analysis."
  },
  {
    step: "02",
    title: "Skin Tone Analysis",
    icon: Palette,
    description: "StyleSense AI detects your exact complexion and undertones (cool, warm, neutral) using professional color theory."
  },
  {
    step: "03",
    title: "Choose Preferences",
    icon: Compass,
    description: "Select from styles like Casual, Formal, Ethnic, Streetwear, or Sports, and set your ideal shopping budget."
  },
  {
    step: "04",
    title: "Color Recommendation",
    icon: CheckCircle,
    description: "Get a customized color palette designed to harmonize with your complexion and elevate your presence."
  },
  {
    step: "05",
    title: "Outfit Recommendations",
    icon: Shirt,
    description: "Receive complete, AI-generated outfit combinations including tops, bottoms, footwear, hairstyle suggestions, and accessories."
  },
  {
    step: "06",
    title: "Shop From Brands",
    icon: ShoppingBag,
    description: "Explore and shop direct matches from top Indian platforms: Myntra, Ajio, Amazon Fashion, and Flipkart."
  }
];

function LandingNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="landing-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Sparkles className="logo-sparkle" size={24} />
          <span>StyleSense</span>
        </Link>

        {/* Desktop nav - Removed as requested */}
        <div style={{ flex: 1 }} />

        <div className="navbar-actions">
          <button className="navbar-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">Go to Dashboard <ArrowRight size={14} /></Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-nav-menu fade-in">
          {user ? (
            <Link to="/dashboard" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 16px" }}>
              <Link to="/login" className="btn btn-outline btn-full" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-full" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default function LandingPage() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <LandingNavbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="section-container hero-container">
          <motion.div 
            className="hero-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-badge">
              <Sparkles size={14} style={{ color: "var(--accent)" }} />
              <span>Next-Gen AI Styling</span>
            </div>
            <h1 className="hero-headline">Discover Your Perfect Style with AI</h1>
            <p className="hero-subheading">
              Get personalized outfit recommendations, color analysis, style guidance, and fashion insights powered by artificial intelligence.
            </p>
            <div className="hero-cta-buttons">
              <Link to="/signup" className="btn btn-primary btn-lg">Get Started</Link>
              <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">98%</span>
                <span className="stat-label">Match Accuracy</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Outfits Curated</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4</span>
                <span className="stat-label">Top Indian Brands</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="hero-right"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="image-collage">
              <div className="collage-card card card-1">
                <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80" alt="Women fashion model" />
                <div className="card-info">
                  <span className="badge badge-gold">Premium styling</span>
                  <h4>Casual Chic</h4>
                </div>
              </div>
              <div className="collage-card card card-2">
                <img src="https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=400&q=80" alt="Men fashion model" />
                <div className="card-info">
                  <span className="badge badge-purple">AI recommendation</span>
                  <h4>Smart Casual</h4>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section" id="categories">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Explore Style Categories</h2>
            <p className="section-subtitle">No matter the occasion, StyleSense has you covered with custom curated sets.</p>
          </div>

          <div className="categories-grid">
            {CATEGORIES.map((cat, i) => (
              <motion.div 
                key={cat.title} 
                className="category-card card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <div className="category-img-container">
                  <img src={cat.image} alt={cat.title} className="category-img" />
                  <div className="category-overlay">
                    <span className="btn btn-gold btn-sm">Get Styled <ArrowRight size={12} /></span>
                  </div>
                </div>
                <div className="category-info">
                  <h3>{cat.title}</h3>
                  <p>{cat.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">How StyleSense Works</h2>
            <p className="section-subtitle">Our AI model analyzes your features and taste in seconds to craft the perfect wardrobe.</p>
          </div>

          <div className="flow-grid">
            {STEPS.map((step, i) => (
              <motion.div 
                key={step.step}
                className="flow-step-card card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="flow-step-header">
                  <span className="flow-step-number">{step.step}</span>
                  <div className="flow-step-icon-wrapper">
                    <step.icon size={20} />
                  </div>
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-left">
            <Link to="/" className="navbar-logo" style={{ marginBottom: 12 }}>
              <Sparkles className="logo-sparkle" size={20} />
              <span>StyleSense</span>
            </Link>
            <p>Your premium personal AI fashion stylist assistant. Curating confidence, one outfit at a time.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Product</h4>
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="footer-link">Home</button>
              <button onClick={() => scrollToSection("how-it-works")} className="footer-link">How it Works</button>
              <button onClick={() => scrollToSection("categories")} className="footer-link">Categories</button>
            </div>
            <div>
              <h4>Social</h4>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-link">Instagram</a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="footer-link">Pinterest</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-link">Twitter</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} StyleSense AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
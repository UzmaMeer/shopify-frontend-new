import React, { useState, useEffect } from 'react';
import './LandingPage.css';

// 🟢 1. STATIC REVIEWS (Fail-Safe)
const STATIC_REVIEWS = [
    { name: "Sarah K.", rating: 5, comment: "Sales increased by 30% after using these videos!", designation: "Fashion Store Owner" },
    { name: "Ali Raza", rating: 5, comment: "Best tool for Shopify. Saves me hours of editing.", designation: "Gadget Shop" },
    { name: "Zara M.", rating: 4, "comment": "Templates are very professional. Highly recommended.", designation: "Decor Brand" },
    { name: "Usman T.", rating: 5, "comment": "My TikTok ads are finally performing well.", designation: "Dropshipper" },
];

const LandingPage = ({ shopName, setShopName, handleInstall, backendUrl }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [reviews, setReviews] = useState(STATIC_REVIEWS);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '', designation: 'Store Owner' });

  // 🟢 NEW: PREVIEW STATE
  const [previewTemplate, setPreviewTemplate] = useState(null); 

  // 🟢 UPDATED TEMPLATE IDs TO MATCH BACKEND OVERLAYS
  const templates = [
    { 
      id: 'luxury', // Was 'royal'
      title: 'Royal Minimalist', 
      category: 'Luxury', 
      img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80',
      config: { tone: 'Luxury', theme: 'Cinematic', voice: 'female' } 
    },
    { 
      id: 'sale', // Was 'flash'
      title: 'Flash Impact', 
      category: 'Sale', 
      img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&q=80',
      config: { tone: 'Urgent', theme: 'Modern', voice: 'male' } 
    },
    { 
      id: 'kids', 
      title: 'Kids & Play', 
      category: 'Kids', 
      img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80',
      config: { tone: 'Funny', theme: 'Dynamic', voice: 'female' } 
    },
    { 
      id: 'story', 
      title: 'Storyteller', 
      category: 'General', 
      img: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=400&q=80',
      config: { tone: 'Professional', theme: 'Modern', voice: 'male' } 
    },
    { 
      id: 'winter', // Was 'festive'
      title: 'Festive Season', 
      category: 'Holiday', 
      img: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=400&q=80',
      config: { tone: 'Excited', theme: 'Cinematic', voice: 'female' } 
    }
  ];

  // Fetch Reviews Logic
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const API_URL = backendUrl || "http://localhost:8000"; 
        const res = await fetch(`${API_URL}/api/reviews`);
        if (!res.ok) throw new Error("Backend not connected");
        
        const data = await res.json();
        if (data.reviews && data.reviews.length > 0) {
            setReviews(data.reviews);
        }
      } catch (e) {
        console.warn("⚠️ Using Static Reviews (Backend Offline):", e);
      }
    };
    fetchReviews();
  }, [backendUrl]);

  // 🟢 1. CLICK OPENS PREVIEW MODAL
  const handleTemplateClick = (template) => {
    setPreviewTemplate(template); 
  };

  // 🟢 2. CONFIRM SELECTION (Inside Modal)
  const confirmTemplateSelection = () => {
    if (!previewTemplate) return;
    
    setSelectedTemplate(previewTemplate.id);
    // Save settings so VideoModal can use them
    localStorage.setItem('selectedTemplateConfig', JSON.stringify(previewTemplate.config));
    console.log("Template Selected:", previewTemplate.title);
    
    setPreviewTemplate(null); // Close Modal
  };

  const submitReview = async () => {
    const API_URL = backendUrl || "http://localhost:8000";
    try {
      await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      alert("Thanks! Your review has been submitted for approval.");
      setShowReviewModal(false);
      setNewReview({ name: '', rating: 5, comment: '', designation: 'Store Owner' });
    } catch (e) {
      alert("Error submitting review. Check console.");
    }
  };

  return (
    <div className="polaris-layout">
      {/* HEADER */}
      <nav className="polaris-nav-styled">
        <div className="nav-content">
          <div className="nav-left-brand">
            <img src="https://cdn-icons-png.flaticon.com/512/154/154859.png" width="22" alt="logo" />
            <span className="brand-text">Shopify <span className="app-store-text">App Store</span></span>
          </div>
          <div className="nav-search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search apps..." readOnly />
          </div>
        </div>
      </nav>

      <div className="main-container">
        
        {/* --- LEFT SIDEBAR --- */}
        <aside className="left-sidebar">
          <div className="app-card-main">
            <div className="app-main-icon">▶</div>
            <div className="app-main-title">
              <h1>VideoAI Maker</h1>
              <p className="rating-text">★ 4.9 (500+ Reviews)</p>
            </div>
          </div>

          <div className="install-box-styled">
            <label className="input-label">Store URL</label>
            <input 
              type="text" 
              className="store-input"
              placeholder="store.myshopify.com"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
            <button className="primary-install-btn" onClick={handleInstall}>Install App</button>
            <p className="trial-text">14-Day Free Trial • No Credit Card</p>
          </div>

          <div className="trust-badges">
            <span className="badge">Built for Shopify</span>
            <span className="badge">Fast Rendering</span>
          </div>
        </aside>

        {/* --- RIGHT CONTENT --- */}
        <main className="right-content-area">
          
          <section className="hero-banner-v3">
            <div className="banner-content">
              <h2>Create Viral Ads in Seconds</h2>
              <p>Turn static product images into high-converting video ads automatically.</p>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80" 
              alt="Promo Poster" 
              className="poster-img-v3"
            />
          </section>

          {/* TEMPLATES GRID */}
          <section className="templates-section">
            <div className="section-header">
              <h3>Choose a Style</h3>
              <p>Click a template to preview the animation & overlay effects.</p>
            </div>
            
            <div className="templates-grid">
              {templates.map((temp) => (
                <div 
                  key={temp.id}
                  onClick={() => handleTemplateClick(temp)}
                  className={`template-card ${selectedTemplate === temp.id ? 'active-template' : ''}`}
                >
                  <div className="template-img-box">
                    <img src={temp.img} alt={temp.title} />
                    <span className="category-pill">{temp.category}</span>
                    {/* 🟢 Play Icon Hint */}
                    <div className="play-overlay">▶</div>
                  </div>
                  <div className="template-info">
                    <h4>{temp.title}</h4>
                    {selectedTemplate === temp.id ? 
                        <span className="selected-check">Selected ✓</span> : 
                        <span className="preview-text">Click to Preview</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* REVIEWS SECTION */}
          <section className="reviews-section">
            <div className="section-header-row">
              <h3>Trusted by Merchants</h3>
              <button className="text-btn" onClick={() => setShowReviewModal(true)}>+ Write a Review</button>
            </div>

            <div className="reviews-grid">
              {reviews.map((rev, index) => (
                <div className="review-card" key={index}>
                  <div className="rev-header">
                    <div className="rev-avatar">{rev.name ? rev.name.charAt(0) : 'U'}</div>
                    <div>
                      <div className="rev-name">{rev.name}</div>
                      <div className="rev-desig">{rev.designation}</div>
                    </div>
                  </div>
                  <div className="rev-stars">{'★'.repeat(rev.rating)}</div>
                  <p className="rev-body">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>

      {/* 🟢 TEMPLATE PREVIEW MODAL */}
      {previewTemplate && (
        <div className="modal-overlay">
          <div className="preview-modal-content">
            <div className="preview-header">
                <h3>{previewTemplate.title} Preview</h3>
                <button className="close-icon" onClick={() => setPreviewTemplate(null)}>&times;</button>
            </div>
            
            <div className="preview-body">
                {/* 📱 Mobile Frame Simulator */}
                <div className="mobile-frame">
                    <div className={`screen-content temp-${previewTemplate.id}`}>
                        <img src={previewTemplate.img} alt="Demo Product" className="demo-bg-img" />
                        
                        {/* 🟢 CSS OVERLAYS TO MIMIC REAL TEMPLATES */}
                        {previewTemplate.id === 'sale' && (
                            <>
                                <div className="overlay-badge top-badge">⚡ FLASH SALE ⚡</div>
                                <div className="overlay-badge bottom-badge">LIMITED TIME ONLY</div>
                            </>
                        )}
                        {previewTemplate.id === 'winter' && (
                            <>
                                <div className="overlay-badge winter-badge">❄️ WINTER SPECIAL</div>
                                <div className="snowflakes"></div> 
                            </>
                        )}
                        {previewTemplate.id === 'luxury' && (
                            <div className="luxury-border-text">PREMIUM COLLECTION</div>
                        )}
                         {previewTemplate.id === 'kids' && (
                            <div className="kids-text">🧸 FUN TIME!</div>
                        )}
                    </div>
                </div>
                
                <div className="preview-details">
                    <h4>About this Template:</h4>
                    <p>Best suited for: <b>{previewTemplate.category}</b></p>
                    <ul>
                        <li><b>Tone:</b> {previewTemplate.config.tone}</li>
                        <li><b>Theme:</b> {previewTemplate.config.theme}</li>
                        <li><b>Effect:</b> {previewTemplate.category} Overlay applied automatically.</li>
                    </ul>
                    <p style={{fontSize:'12px', color:'#666', marginTop:'15px'}}>* This is a simulation. Your actual product images will be used.</p>
                </div>
            </div>

            <div className="preview-footer">
                <button className="btn-action secondary" onClick={() => setPreviewTemplate(null)}>Close</button>
                <button className="btn-action btn-primary" onClick={confirmTemplateSelection}>✅ Use This Template</button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-content-review">
            <h3>Write a Review</h3>
            <input placeholder="Your Name" value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})} />
            <input placeholder="Store Name / Designation" value={newReview.designation} onChange={e => setNewReview({...newReview, designation: e.target.value})} />
            <textarea placeholder="Your Experience..." value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} />
            <select value={newReview.rating} onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value)})}>
              <option value="5">5 Stars - Amazing</option>
              <option value="4">4 Stars - Good</option>
              <option value="3">3 Stars - Average</option>
            </select>
            <div className="modal-actions">
              <button onClick={() => setShowReviewModal(false)}>Cancel</button>
              <button className="primary-btn" onClick={submitReview}>Submit Review</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
import React, { useState, useEffect } from 'react';
import './LandingPage.css';

// 🟢 1. STATIC REVIEWS (Fail-Safe)
const STATIC_REVIEWS = [
    { name: "Sarah K.", rating: 5, comment: "Sales increased by 30% after using these videos!", designation: "Fashion Store Owner" },
    { name: "Ali Raza", rating: 5, comment: "Best tool for Shopify. Saves me hours of editing.", designation: "Gadget Shop" },
    { name: "Zara M.", rating: 4, comment: "Templates are very professional. Highly recommended.", designation: "Decor Brand" },
    { name: "Usman T.", rating: 5, comment: "My TikTok ads are finally performing well.", designation: "Dropshipper" },
];

const LandingPage = ({ shopName, setShopName, backendUrl }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [reviews, setReviews] = useState(STATIC_REVIEWS);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '', designation: 'Store Owner' });
  const [previewTemplate, setPreviewTemplate] = useState(null); 
  const [showPlanSelection, setShowPlanSelection] = useState(false);

  // 🟢 2. TEMPLATES CONFIGURATION
  const templates = [
    { id: 'luxury', title: 'Royal Minimalist', category: 'Luxury', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80', config: { tone: 'Luxury', theme: 'Cinematic', voice: 'female' } },
    { id: 'sale', title: 'Flash Impact', category: 'Sale', img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&q=80', config: { tone: 'Urgent', theme: 'Modern', voice: 'male' } },
    { id: 'kids', title: 'Kids & Play', category: 'Kids', img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80', config: { tone: 'Funny', theme: 'Dynamic', voice: 'female' } },
    { id: 'story', title: 'Storyteller', category: 'General', img: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=400&q=80', config: { tone: 'Professional', theme: 'Modern', voice: 'male' } },
    { id: 'winter', title: 'Festive Season', category: 'Holiday', img: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=400&q=80', config: { tone: 'Excited', theme: 'Cinematic', voice: 'female' } }
  ];

  // 🟢 3. FETCH REVIEWS FROM BACKEND
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const API_URL = backendUrl || "http://localhost:8000"; 
        const res = await fetch(`${API_URL}/api/reviews`);
        const data = await res.json();
        if (data.reviews?.length > 0) setReviews(data.reviews);
      } catch (e) { console.warn("Using Static Reviews"); }
    };
    fetchReviews();
  }, [backendUrl]);

  // 🟢 4. PROFESSIONAL INSTALLATION TRIGGER
  const handleInstallClick = () => {
    // Basic validation agar URL field use ho rahi ho
    if (shopName && !shopName.includes('.myshopify.com') && !shopName.includes('.')) {
        setShopName(`${shopName}.myshopify.com`);
    }
    setShowPlanSelection(true); 
  };

  const confirmPlanAndInstall = () => {
    setShowPlanSelection(false);
    
    // ✅ Use your actual Ngrok URL from your config
    const API_BASE = "https://snakiest-edward-autochthonously.ngrok-free.dev"; 
    
    const authUrl = shopName 
        ? `${API_BASE}/api/auth?shop=${shopName}` 
        : `${API_BASE}/api/auth`; 
    
    window.location.href = authUrl; 
};
  // 🟢 5. TEMPLATE PREVIEW LOGIC
  const handleTemplateClick = (template) => setPreviewTemplate(template);

  const confirmTemplateSelection = () => {
    if (!previewTemplate) return;
    setSelectedTemplate(previewTemplate.id);
    localStorage.setItem('selectedTemplateConfig', JSON.stringify(previewTemplate.config));
    setPreviewTemplate(null); 
  };

  // 🟢 6. REVIEW SUBMISSION
  const submitReview = async () => {
    const API_URL = backendUrl || "http://localhost:8000";
    try {
      await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      alert("Review submitted!");
      setShowReviewModal(false);
    } catch (e) { alert("Error submitting review."); }
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
        {/* SIDEBAR */}
        <aside className="left-sidebar">
          <div className="app-card-main">
            <div className="app-main-icon">▶</div>
            <div className="app-main-title">
              <h1>VideoAI Maker</h1>
              <p className="rating-text">★ 4.9 (500+ Reviews)</p>
            </div>
          </div>

          <div className="install-box-styled">
            <label className="input-label">Store URL (Optional)</label>
            <input 
              type="text" 
              className="store-input"
              placeholder="store.myshopify.com"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
            {/* 🚀 Professional trigger click */}
            <button className="primary-install-btn" onClick={handleInstallClick}>Install App</button>
            <p className="trial-text">Basic Plan: 10 Videos Free</p>
          </div>

          <div className="trust-badges">
            <span className="badge">Built for Shopify</span>
            <span className="badge">Persistent Plan Credits</span>
          </div>
        </aside>

        <main className="right-content-area">
          <section className="hero-banner-v3">
            <div className="banner-content">
              <h2>Create Viral Ads in Seconds</h2>
              <p>Turn static images into high-converting video ads automatically.</p>
            </div>
            <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80" alt="Promo Poster" className="poster-img-v3" />
          </section>

          {/* TEMPLATES GRID */}
          <section className="templates-section">
            <div className="section-header"><h3>Choose a Style</h3><p>Click a template to preview animation & effects.</p></div>
            <div className="templates-grid">
              {templates.map((temp) => (
                <div key={temp.id} onClick={() => handleTemplateClick(temp)} className={`template-card ${selectedTemplate === temp.id ? 'active-template' : ''}`}>
                  <div className="template-img-box">
                    <img src={temp.img} alt={temp.title} /><span className="category-pill">{temp.category}</span>
                    <div className="play-overlay">▶</div>
                  </div>
                  <div className="template-info"><h4>{temp.title}</h4>{selectedTemplate === temp.id ? <span className="selected-check">Selected ✓</span> : <span className="preview-text">Click to Preview</span>}</div>
                </div>
              ))}
            </div>
          </section>

          {/* PRICING SECTION */}
          <section className="pricing-section" style={{marginTop: '40px'}}>
             <div className="section-header" style={{textAlign: 'center', marginBottom: '30px'}}>
               <h3>Choose Your Plan</h3>
               <p>Start for free and scale as you grow.</p>
             </div>
             <div className="pricing-grid-container" style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px'}}>
                <div className="price-card basic" style={{border: '2px solid #ff8c00', borderRadius: '12px', overflow: 'hidden', textAlign: 'center', background: 'white'}}>
                    <div style={{background: '#ff8c00', color: 'white', padding: '15px', fontWeight: 'bold'}}>BASIC PLAN</div>
                    <div style={{fontSize: '36px', fontWeight: '800', padding: '20px 0'}}>0$<span style={{fontSize: '14px', color: '#888'}}> /mo</span></div>
                    <ul style={{listStyle: 'none', padding: '0 20px', textAlign: 'left', marginBottom: '25px', fontSize: '13px'}}>
                        <li style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>✅ 10 Video Generations</li>
                        <li style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>✅ Persistent Store Credits</li>
                        <li style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>✅ All Themes & AI Voices</li>
                    </ul>
                </div>

                <div className="price-card standard locked" style={{border: '1px solid #dfe3e8', borderRadius: '12px', overflow: 'hidden', textAlign: 'center', opacity: 0.7, background: 'white'}}>
                    <div style={{background: '#ff1493', color: 'white', padding: '15px', fontWeight: 'bold'}}>STANDARD PLAN</div>
                    <div style={{fontSize: '36px', fontWeight: '800', padding: '20px 0'}}>49$<span style={{fontSize: '14px', color: '#888'}}> /mo</span></div>
                    <ul style={{listStyle: 'none', padding: '0 20px', textAlign: 'left', marginBottom: '25px', fontSize: '13px'}}>
                        <li style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>🔒 50 Video Generations</li>
                        <li style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>🔒 4K High Resolution</li>
                        <li style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>🔒 Custom Branding</li>
                    </ul>
                </div>

                <div className="price-card premium locked" style={{border: '1px solid #dfe3e8', borderRadius: '12px', overflow: 'hidden', textAlign: 'center', opacity: 0.7, background: 'white'}}>
                    <div style={{background: '#00bfff', color: 'white', padding: '15px', fontWeight: 'bold'}}>PREMIUM PLAN</div>
                    <div style={{fontSize: '36px', fontWeight: '800', padding: '20px 0'}}>99$<span style={{fontSize: '14px', color: '#888'}}> /mo</span></div>
                    <ul style={{listStyle: 'none', padding: '0 20px', textAlign: 'left', marginBottom: '25px', fontSize: '13px'}}>
                        <li style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>🔒 Unlimited Generations</li>
                        <li style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>🔒 24/7 Priority Support</li>
                        <li style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>🔒 Personalized AI Studio</li>
                    </ul>
                </div>
             </div>
          </section>

          {/* REVIEWS SECTION */}
          <section className="reviews-section" style={{marginTop: '40px'}}>
            <div className="section-header-row"><h3>Trusted by Merchants</h3><button className="text-btn" onClick={() => setShowReviewModal(true)}>+ Write a Review</button></div>
            <div className="reviews-grid">
              {reviews.map((rev, index) => (
                <div className="review-card" key={index}>
                  <div className="rev-header"><div className="rev-avatar">{rev.name ? rev.name.charAt(0) : 'U'}</div><div><div className="rev-name">{rev.name}</div><div className="rev-desig">{rev.designation}</div></div></div>
                  <div className="rev-stars">{'★'.repeat(rev.rating)}</div><p className="rev-body">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* 🟢 PLAN SELECTION MODAL (GATED INSTALL) */}
      {showPlanSelection && (
        <div className="modal-overlay">
          <div className="pricing-modal-content" style={{background: 'white', padding: '40px', borderRadius: '20px', maxWidth: '600px', width: '95%', textAlign: 'center'}}>
             <h2 style={{color: '#202223'}}>Professional Installation</h2>
             <p style={{color: '#6d7175', marginBottom: '25px'}}>Acknowledgment of the Basic Plan limit is required to proceed.</p>
             <div className="plan-choice-card basic" style={{border: '2px solid #ff8c00', borderRadius: '12px', padding: '25px', background: '#fffaf0', cursor: 'pointer', textAlign: 'left'}} onClick={confirmPlanAndInstall}>
                <h4 style={{color: '#ff8c00', marginBottom: '10px'}}>BASIC PLAN (10 VIDEOS)</h4>
                <p style={{fontSize: '14px', color: '#444'}}>Start generating AI videos immediately. Proceeding will trigger the Shopify OAuth handshake.</p>
                <button className="primary-install-btn" style={{width: '100%', marginTop: '15px'}}>Confirm & Install</button>
             </div>
             <button className="text-btn" style={{marginTop: '20px', display: 'block', width: '100%'}} onClick={() => setShowPlanSelection(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* TEMPLATE PREVIEW MODAL */}
      {previewTemplate && (
        <div className="modal-overlay">
          <div className="preview-modal-content">
            <div className="preview-header"><h3>{previewTemplate.title} Preview</h3><button className="close-icon" onClick={() => setPreviewTemplate(null)}>&times;</button></div>
            <div className="preview-body">
                <div className="mobile-frame"><div className={`screen-content temp-${previewTemplate.id}`}><img src={previewTemplate.img} alt="Demo" className="demo-bg-img" /></div></div>
                <div className="preview-details">
                    <h4>Template Details:</h4>
                    <p>Ideal for 10-video basic usage.</p>
                    <ul><li><b>Tone:</b> {previewTemplate.config.tone}</li><li><b>Theme:</b> {previewTemplate.config.theme}</li></ul>
                </div>
            </div>
            <div className="preview-footer">
                <button className="btn-action secondary" onClick={() => setPreviewTemplate(null)}>Close</button>
                <button className="btn-action btn-primary" onClick={confirmTemplateSelection}>✅ Use This Template</button>
            </div>
          </div>
        </div>
      )}

      {/* WRITE REVIEW MODAL */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-content-review">
            <h3>Write a Review</h3>
            <input placeholder="Your Name" value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})} />
            <textarea placeholder="Your Experience..." value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} />
            <div className="modal-actions"><button onClick={() => setShowReviewModal(false)}>Cancel</button><button className="primary-btn" onClick={submitReview}>Submit Review</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
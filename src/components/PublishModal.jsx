import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Circle, Trash2 } from 'lucide-react';
import './PublishModal.css';
// 🟢 1. Dynamic Configuration Import
// This ensures the modal always talks to the correct backend (Ngrok or Production)
import { BACKEND_URL } from '../config'; 

// --- ICONS (SVG) ---
const TikTokIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.589 6.686C17.273 6.686 15.308 4.869 14.882 2.708H10.684V14.887C10.684 17.028 8.945 18.766 6.805 18.766C4.665 18.766 2.926 17.028 2.926 14.887C2.926 12.747 4.665 11.008 6.805 11.008C7.175 11.008 7.53 11.06 7.865 11.156V6.924C7.525 6.883 7.17 6.861 6.805 6.861C2.373 6.861 -1.219 10.453 -1.219 14.887C-1.219 19.321 2.373 22.913 6.805 22.913C11.237 22.913 14.829 19.321 14.829 14.887V8.526C16.398 9.663 18.283 10.419 20.354 10.655V6.471C20.106 6.455 19.851 6.446 19.589 6.446V6.686Z" fill="#000000"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0z" fill="url(#paint0_linear)"/>
    <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zM12 16c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z" fill="url(#paint0_linear)"/>
    <path d="M18.406 4.155c-.786 0-1.425.639-1.425 1.425 0 .786.639 1.425 1.425 1.425.786 0 1.425-.639 1.425-1.425 0-.786-.639-1.425-1.425-1.425z" fill="url(#paint0_linear)"/>
    <defs><linearGradient id="paint0_linear" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse"><stop stopColor="#f09433"/><stop offset="0.25" stopColor="#e6683c"/><stop offset="0.5" stopColor="#dc2743"/><stop offset="0.75" stopColor="#cc2366"/><stop offset="1" stopColor="#bc1888"/></linearGradient></defs>
  </svg>
);
const FacebookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.415 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.925-1.956 1.874v2.276h3.328l-.532 3.49h-2.796V24C19.585 23.094 24 18.1 24 12.073z" fill="#1877F2"/>
  </svg>
);

// --- COMPONENT START ---
// 🚀 Critical Prop: 'productId' is required here to generate the "Shop Now" link.
const PublishModal = ({ onClose, renderJobId, isProcessing, productId }) => {
  const [accounts, setAccounts] = useState([]);
  const [posting, setPosting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [selected, setSelected] = useState({ instagram: true, facebook: true, tiktok: true });

  // --- 1. Fetch Connected Accounts ---
  // Checks the backend to see which social accounts (FB, Insta, TikTok) are linked.
  const checkConnection = (isManual = false) => {
    if(isManual) setChecking(true);
    
    fetch(`${BACKEND_URL}/api/social-accounts`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true" 
        }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setAccounts(data.accounts || []);
          if (isManual) alert("✅ Account Status Updated!");
        }
        setChecking(false);
      })
      .catch(err => { 
        console.error("Fetch Error:", err); 
        setChecking(false); 
      });
  };

  useEffect(() => {
    checkConnection(false);
    // Listen for messages from the popup login window
    const handleMessage = (event) => {
      if (event.data === 'login-success') {
        checkConnection(false); 
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // --- 2. Handle Login Popup ---
  // Opens a separate window for OAuth (Facebook/TikTok login)
  const handleConnect = (platform) => {
    const url = `${BACKEND_URL}/login/${platform}`;
    const w = 500, h = 600;
    const y = window.top.outerHeight / 2 + window.top.screenY - (h / 2);
    const x = window.top.outerWidth / 2 + window.top.screenX - (w / 2);
    window.open(url, 'ConnectSocial', `width=${w},height=${h},top=${y},left=${x}`);
  };

  // --- 3. Handle Disconnect ---
  const handleDisconnect = async (platform, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to disconnect ${platform}?`)) return;
    
    try {
        await fetch(`${BACKEND_URL}/api/disconnect/${platform}`, { 
            method: 'DELETE',
            headers: { "ngrok-skip-browser-warning": "true" }
        });
        setAccounts(prev => prev.filter(acc => acc.platform !== platform));
    } catch (err) { alert("Backend communication error."); }
  };

  const toggleSelection = (platform) => {
    setSelected(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  // --- 4. Handle Publish (The "Shop Now" Logic) ---
  const handlePublish = async () => {
    const connectedPlatforms = accounts.map(a => a.platform);
    const targets = Object.keys(selected).filter(p => selected[p] === true && connectedPlatforms.includes(p));
    
    if (targets.length === 0) return alert("⚠️ Please select at least one connected account.");

    setPosting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/queue-publish`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
        // 🚀 SHOP NOW PAYLOAD:
        // We pass 'product_id' to the backend. The Python backend uses this ID
        // to generate the "Shop Now" button on Facebook and Product Tags on Instagram.
        body: JSON.stringify({ 
            render_job_id: renderJobId, 
            accounts: targets,
            product_id: productId 
        })
      });
      const result = await response.json();
      
      if(result.status === 'queued') {
          alert("✅ Publishing Queued! You can close this window. We'll upload the video automatically when it finishes.");
          onClose();
      } else if (result.status === 'completed') {
          alert("✅ Published Successfully!");
          onClose();
      } else {
          alert("⚠️ Error: " + JSON.stringify(result));
      }
    } catch (error) { 
        alert("❌ Backend Error: Is your Python server running?"); 
    }
    setPosting(false);
  };

  const isConnected = (platform) => accounts.some(acc => acc.platform === platform);

  const renderButton = (platform, label, IconComponent, disabled = false) => {
    const connected = isConnected(platform);
    const isSelected = selected[platform];

    return (
        <button 
            className={`pill-btn ${connected ? 'connected-state' : ''} ${disabled ? 'disabled-state' : ''}`}
            onClick={() => { if (!disabled) connected ? toggleSelection(platform) : handleConnect(platform); }}
        >
            <div className="btn-inner">
                <span className="brand-icon"><IconComponent /></span>
                <span className="btn-text">
                    {connected ? `Post to ${label}` : `Connect ${label} business account`}
                </span>
                <div className="right-actions-group">
                    {connected && (
                        <div className="disconnect-btn" onClick={(e) => handleDisconnect(platform, e)}>
                            <Trash2 size={16} />
                        </div>
                    )}
                    {connected && isSelected && <span className="check-mark"><CheckCircle size={20} fill="#008060" color="white"/></span>}
                    {connected && !isSelected && <span className="check-mark"><Circle size={20} color="#ccc"/></span>}
                </div>
            </div>
        </button>
    );
  };

  return (
    <div className="modal-overlay" style={{zIndex: 2000}}>
      <div className="exact-modal">
        <div className="badge-wrap"><span className="pill-badge">✨ Ready to Publish</span></div>
        <button className="close-btn-abs" onClick={onClose}><X size={18}/></button>

        <h2 className="exact-title">
            {isProcessing 
                ? "Video is processing. Select accounts to Auto-Publish:" 
                : "Video is ready. Publish now:"}
        </h2>

        <div className="pill-stack">
            {renderButton('tiktok', 'TikTok', TikTokIcon)}
            {renderButton('instagram', 'Instagram', InstagramIcon)}
            {renderButton('facebook', 'Facebook', FacebookIcon)}
        </div>

        <div onClick={() => checkConnection(true)} className="tiny-refresh">
            {checking ? "Checking..." : "Tap here if you connected but don't see it"}
        </div>

        <div className="exact-footer">
            <span className="discard-link" onClick={onClose}>Cancel</span>
            <div className="footer-btns">
                <button className="footer-btn primary" onClick={handlePublish} disabled={posting}>
                   {posting ? "Processing..." : (isProcessing ? "Queue Auto-Publish" : "Publish Now")}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './PublishModal.css'; // Reusing CSS for consistent look

const BrandKitModal = ({ onClose, shopName, backendUrl }) => {
    const [logoUrl, setLogoUrl] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#000000');
    const [fontChoice, setFontChoice] = useState('Roboto');
    const [ctaText, setCtaText] = useState('Shop Now');
    const [saving, setSaving] = useState(false);

    // Load existing settings
    useEffect(() => {
        fetch(`${backendUrl}/api/get-brand-settings?shop=${shopName}`, {
             headers: { "ngrok-skip-browser-warning": "true" }
        })
        .then(res => res.json())
        .then(data => {
            if(data && !data.error) {
                setLogoUrl(data.logo_url || '');
                setPrimaryColor(data.primary_color || '#000000');
                setFontChoice(data.font_choice || 'Roboto');
                setCtaText(data.cta_text || 'Shop Now');
            }
        });
    }, [shopName, backendUrl]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`${backendUrl}/api/save-brand-settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
                body: JSON.stringify({
                    shop: shopName,
                    logo_url: logoUrl,
                    primary_color: primaryColor,
                    font_choice: fontChoice,
                    cta_text: ctaText
                })
            });
            alert("✅ Brand Settings Saved!");
            onClose();
        } catch (e) {
            alert("❌ Save Failed");
        }
        setSaving(false);
    };

    return (
        <div className="modal-overlay" style={{zIndex: 3000}}>
            <div className="exact-modal" style={{width: '500px', textAlign:'left', alignItems:'flex-start'}}>
                <button className="close-btn-abs" onClick={onClose}><X size={18}/></button>
                <h2 className="exact-title" style={{marginBottom:'20px'}}>🎨 Brand Kit Settings</h2>

                <div style={{width:'100%', display:'flex', flexDirection:'column', gap:'15px'}}>
                    <div>
                        <label style={{fontSize:'12px', fontWeight:'bold', display:'block', marginBottom:'5px'}}>Logo URL</label>
                        <input type="text" value={logoUrl} onChange={e=>setLogoUrl(e.target.value)} placeholder="https://..." style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ccc'}} />
                    </div>

                    <div>
                        <label style={{fontSize:'12px', fontWeight:'bold', display:'block', marginBottom:'5px'}}>Primary Brand Color</label>
                        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                            <input type="color" value={primaryColor} onChange={e=>setPrimaryColor(e.target.value)} style={{height:'40px', width:'60px'}} />
                            <span style={{fontSize:'14px', color:'#555'}}>{primaryColor}</span>
                        </div>
                    </div>

                    <div>
                        <label style={{fontSize:'12px', fontWeight:'bold', display:'block', marginBottom:'5px'}}>Font Style</label>
                        <select value={fontChoice} onChange={e=>setFontChoice(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ccc'}}>
                            <option value="Roboto">Roboto (Clean)</option>
                            <option value="Playfair Display">Playfair (Elegant)</option>
                            <option value="Oswald">Oswald (Bold)</option>
                        </select>
                    </div>

                    <div>
                         <label style={{fontSize:'12px', fontWeight:'bold', display:'block', marginBottom:'5px'}}>Default CTA Text</label>
                         <input type="text" value={ctaText} onChange={e=>setCtaText(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ccc'}} />
                    </div>
                </div>

                <div className="exact-footer" style={{marginTop:'30px'}}>
                    <span className="discard-link" onClick={onClose}>Cancel</span>
                    <button className="footer-btn primary" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BrandKitModal;
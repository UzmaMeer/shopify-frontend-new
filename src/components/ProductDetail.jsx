import React, { useEffect, useState } from 'react';
import './ProductDetail.css'; 
import VideoModal from './VideoModal';
import { BACKEND_URL } from '../config'; 

const ProductDetail = ({ productId, shopName, onBack }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); 
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // Existing Generation States
  const [selectedVideoImages, setSelectedVideoImages] = useState([]); 
  const [voiceGender, setVoiceGender] = useState('female');
  const [duration, setDuration] = useState(15);
  const [scriptTone, setScriptTone] = useState('Professional');
  const [videoTheme, setVideoTheme] = useState('Modern');
  const [musicFile, setMusicFile] = useState(null);

  // 🟢 NEW: Custom Logic States
  const [customScript, setCustomScript] = useState('');
  const [userVoiceFile, setUserVoiceFile] = useState(null);

  const maxImagesAllowed = Math.floor(duration / 3);

  // 1. Fetch Product Details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/products?shop=${shopName}`, {
          method: "GET",
          headers: { 
              "Content-Type": "application/json", 
              "ngrok-skip-browser-warning": "true" 
          }
        });
        const data = await response.json();
        if (data.products) {
          const foundProduct = data.products.find(p => p.id === productId);
          if (foundProduct) {
            setProduct(foundProduct);
            const allImages = foundProduct.images ? foundProduct.images.map(img => img.src) : [];
            if (allImages.length > 0) setSelectedImage(allImages[0]);
            const initialMax = 5; 
            setSelectedVideoImages(allImages.slice(0, initialMax)); 
          }
        }
      } catch (error) { console.error("Error:", error); } finally { setLoading(false); }
    };
    if (productId) fetchDetails();
  }, [productId, shopName]);

  // 2. Image Caching
  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
        const imagesToCache = product.images.map(img => img.src);
        fetch(`${BACKEND_URL}/api/cache-images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: imagesToCache })
        })
        .catch(err => console.warn("Caching Warning:", err));
    }
  }, [product]); 

  const toggleImageSelection = (imgSrc) => {
    if (selectedVideoImages.includes(imgSrc)) {
        setSelectedVideoImages(selectedVideoImages.filter(img => img !== imgSrc));
    } else {
        if (selectedVideoImages.length >= maxImagesAllowed) {
            alert(`⚠️ Limit Reached! Max ${maxImagesAllowed} images for ${duration}s.`);
            return;
        }
        setSelectedVideoImages([...selectedVideoImages, imgSrc]);
    }
  };

  const handleGenerateClick = () => {
    if (selectedVideoImages.length === 0) return alert("⚠️ Please select at least 1 image!");
    if (selectedVideoImages.length > maxImagesAllowed) return alert(`⚠️ Too many images selected.`);
    setShowVideoModal(true);
  };

  const handleDurationChange = (e) => setDuration(parseInt(e.target.value));

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!product) return <div>Product not found. <button onClick={onBack}>Go Back</button></div>;

  const images = product.images || [];
  const price = product.variants && product.variants[0] ? product.variants[0].price : '0.00';
  const currency = "PKR"; 

  return (
    <div className="detail-page-container">
      {showVideoModal && (
        <VideoModal 
          product={product}
          shopName={shopName}
          selectedImages={selectedVideoImages}
          voiceGender={voiceGender}
          duration={duration}
          scriptTone={scriptTone}
          videoTheme={videoTheme}
          musicFile={musicFile}
          // 🟢 Pass new custom props to the Modal
          customScript={customScript}
          userVoiceFile={userVoiceFile}
          onClose={() => setShowVideoModal(false)} 
        />
      )}

      <div className="back-nav"><button className="back-btn" onClick={onBack}>← Back to Collection</button></div>

      <div className="product-layout">
        <div className="image-gallery">
          <div className="main-image-frame">
            <img src={selectedImage || 'https://via.placeholder.com/600'} alt="Main Product" />
          </div>
          <div className="thumbnails-grid">
            {images.map((img) => {
              const isSelected = selectedVideoImages.includes(img.src);
              return (
                <div key={img.id} style={{position: 'relative', cursor: 'pointer'}}>
                    <img 
                        src={img.src} 
                        className={`thumb-img ${selectedImage === img.src ? 'active-thumb' : ''}`}
                        onClick={() => setSelectedImage(img.src)} 
                        style={{opacity: isSelected ? 1 : 0.4, filter: isSelected ? 'none' : 'grayscale(100%)'}} 
                    />
                    <div 
                        onClick={(e) => { e.stopPropagation(); toggleImageSelection(img.src); }}
                        style={{
                            position: 'absolute', top: '5px', right: '5px', width: '24px', height: '24px', 
                            borderRadius: '50%', backgroundColor: isSelected ? '#008060' : 'white',
                            border: isSelected ? 'none' : '2px solid #ccc', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', zIndex: 10,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                    >
                        {isSelected && <span style={{color:'white', fontSize:'14px', fontWeight:'bold'}}>✓</span>}
                    </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="product-info-panel">
          <div className="store-brand-name">{shopName.replace('.myshopify.com', '')}</div>
          <h1 className="product-title-large">{product.title}</h1>
          <div className="product-price"><span>{currency} {price}</span></div>

          <div className="ai-action-box">
            <h3 style={{fontSize:'18px', marginBottom:'15px'}}>✨ AI Video Studio</h3>
            
            {/* 🟢 CUSTOM SCRIPT BOX */}
            <div className="custom-option">
                <label>📝 Custom Script / Instructions:</label>
                <textarea 
                    placeholder="Type exactly what the narrator should say (Optional)..." 
                    value={customScript} 
                    onChange={(e) => setCustomScript(e.target.value)} 
                    className="custom-select"
                    style={{height: '80px', resize: 'none', paddingTop: '10px'}}
                />
            </div>

            {/* 🟢 USER VOICE UPLOAD */}
            <div className="custom-option">
                <label>🎙️ Use Your Own Voice (Optional):</label>
                <input 
                    type="file" 
                    accept="audio/*" 
                    onChange={(e) => setUserVoiceFile(e.target.files[0])} 
                    className="file-input" 
                />
                <small style={{fontSize:'10px', color:'#666', display:'block', marginTop:'4px'}}>
                    *Overrides Narrator selection if uploaded.
                </small>
            </div>

            <div className="custom-option">
                <label>🗣️ Narrator Selection:</label>
                <div className="radio-group">
                    <label><input type="radio" name="voice" value="female" checked={voiceGender === 'female'} onChange={(e) => setVoiceGender(e.target.value)} /> 👩 Female</label>
                    <label><input type="radio" name="voice" value="male" checked={voiceGender === 'male'} onChange={(e) => setVoiceGender(e.target.value)} /> 👨 Male</label>
                </div>
            </div>

            <div className="custom-option">
                <label>⏱️ Duration: <b>{duration}s</b></label>
                <input type="range" min="10" max="60" step="5" value={duration} onChange={handleDurationChange} className="slider" />
            </div>

            <div className="custom-option">
                <label>🎨 Video Theme:</label>
                <select value={videoTheme} onChange={(e) => setVideoTheme(e.target.value)} className="custom-select">
                    <option value="Modern">Modern (Clean & Static)</option>
                    <option value="Dynamic">Dynamic (Pan & Zoom)</option>
                    <option value="Cinematic">Cinematic (Black & White)</option>
                    <option value="Retro">Retro (Sepia Vintage)</option>
                    <option value="Flash">Flash (High Energy)</option>
                </select>
            </div>

            <div className="custom-option">
                <label>🎵 Background Music (Optional):</label>
                <input type="file" accept="audio/*" onChange={(e) => setMusicFile(e.target.files[0])} className="file-input" />
            </div>

            <button className="generate-btn-large" onClick={handleGenerateClick}>Generate Video</button>
          </div>

          <div className="description-container">
            <div className="desc-label">About the Product</div>
            <div className="html-content" dangerouslySetInnerHTML={{ __html: product.body_html || "<p>No description available.</p>" }} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetail;
import React, { useEffect, useState, useRef } from 'react';
import './ProductDetail.css'; 
import VideoModal from './VideoModal';
import { BACKEND_URL } from '../config'; 
import { Mic, Square, Trash2, Play } from 'lucide-react'; // 🟢 Icons integrated

const ProductDetail = ({ productId, shopName, onBack }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); 
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // 🟢 Persistent usage tracking (100 Video Limit)
  const [videoUsage, setVideoUsage] = useState(0); 

  // Generation States
  const [selectedVideoImages, setSelectedVideoImages] = useState([]); 
  const [voiceGender, setVoiceGender] = useState('female');
  const [duration, setDuration] = useState(15);
  const [scriptTone, setScriptTone] = useState('Professional');
  const [videoTheme, setVideoTheme] = useState('Modern');
  const [musicFile, setMusicFile] = useState(null);
  const [customScript, setCustomScript] = useState('');

  // 🟢 AUDIO RECORDING & PREVIEW STATES
  const [userVoiceFile, setUserVoiceFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null); 
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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
            setSelectedVideoImages(allImages.slice(0, 5)); 
          }
        }
      } catch (error) { console.error("Error:", error); } finally { setLoading(false); }
    };
    if (productId) fetchDetails();
  }, [productId, shopName]);

  // 2. Fetch Usage Credits (100 Limit)
  useEffect(() => {
    if (shopName) {
        fetch(`${BACKEND_URL}/api/usage-status?shop=${shopName}`, {
            headers: { "ngrok-skip-browser-warning": "true" }
        })
        .then(res => res.json())
        .then(data => setVideoUsage(data.count))
        .catch(err => console.error("Usage fetch error:", err));
    }
  }, [shopName, showVideoModal]);

  // 🟢 RECORDING LOGIC FUNCTIONS
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        const recordingFile = new File([audioBlob], `recording_${Date.now()}.mp3`, { type: 'audio/mpeg' });
        
        setUserVoiceFile(recordingFile);
        setAudioURL(URL.createObjectURL(audioBlob));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) { alert("Microphone access denied. Please allow mic permissions."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleManualVoiceUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        setUserVoiceFile(file);
        setAudioURL(URL.createObjectURL(file));
    }
  };

  const clearAudio = () => {
    setUserVoiceFile(null);
    setAudioURL(null);
  };

  // 3. Image Selection Logic
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
    if (videoUsage >= 100) {
        alert("🚫 Credits Exhausted! Limit (100/100) reached. Upgrade for more.");
        return;
    }
    if (selectedVideoImages.length === 0) return alert("⚠️ Please select at least 1 image!");
    setShowVideoModal(true);
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!product) return <div>Product not found. <button onClick={onBack}>Go Back</button></div>;

  const price = product.variants && product.variants[0] ? product.variants[0].price : '0.00';

  return (
    <div className="detail-page-container">
      {showVideoModal && (
        <VideoModal 
          product={product} shopName={shopName} selectedImages={selectedVideoImages}
          voiceGender={voiceGender} duration={duration} scriptTone={scriptTone}
          videoTheme={videoTheme} musicFile={musicFile} customScript={customScript}
          userVoiceFile={userVoiceFile} onClose={() => setShowVideoModal(false)} 
        />
      )}

      <div className="back-nav"><button className="back-btn" onClick={onBack}>← Back to Collection</button></div>

      <div className="product-layout">
        <div className="image-gallery">
          <div className="main-image-frame">
            <img src={selectedImage || 'https://via.placeholder.com/600'} alt="Main product display" />
          </div>
          <div className="thumbnails-grid">
            {product.images?.map((img) => {
              const isSelected = selectedVideoImages.includes(img.src);
              return (
                <div key={img.id} style={{position: 'relative', cursor: 'pointer'}}>
                    <img 
                        src={img.src} 
                        alt="Thumbnail"
                        className={`thumb-img ${selectedImage === img.src ? 'active-thumb' : ''}`} 
                        onClick={() => setSelectedImage(img.src)} 
                        style={{opacity: isSelected ? 1 : 0.4, filter: isSelected ? 'none' : 'grayscale(100%)'}} 
                    />
                    <div onClick={(e) => { e.stopPropagation(); toggleImageSelection(img.src); }} style={{ position: 'absolute', top: '5px', right: '5px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: isSelected ? '#008060' : 'white', border: isSelected ? 'none' : '2px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
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
          <div className="product-price"><span>PKR {price}</span></div>

          <div className="ai-action-box">
            <h3 style={{fontSize:'18px', marginBottom:'15px'}}>✨ AI Video Studio</h3>
            
            {/* 🟢 Visual Credit Tracker (100 Limit) */}
            <div style={{background: '#f4f6f8', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e1e3e5'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600'}}>
                    <span>Plan: <b style={{color:'#008060'}}>Basic</b></span>
                    <span>{videoUsage} / 100 Used</span>
                </div>
                <div style={{height: '8px', background: '#dfe3e8', borderRadius: '4px', marginTop: '8px', overflow: 'hidden'}}>
                    <div style={{ height: '100%', width: `${(videoUsage / 100) * 100}%`, background: videoUsage >= 100 ? '#e11d48' : '#008060', transition: 'width 0.5s ease' }}></div>
                </div>
            </div>

            <div className="custom-option">
                <label>📝 Custom Script / Instructions:</label>
                <textarea placeholder="Type manual script..." value={customScript} onChange={(e) => setCustomScript(e.target.value)} className="custom-select" style={{height: '80px', resize: 'none'}} />
            </div>

            {/* 🟢 Voice Capture (Record + Manual) */}
            <div className="custom-option" style={{border: '1px dashed #ccc', padding: '10px', borderRadius: '8px'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}>🎙️ Add Your Own Voice:</label>
                <div style={{display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center'}}>
                    {!isRecording ? (
                        <button className="record-btn" onClick={startRecording} style={{background: '#e11d48', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <Mic size={16}/> Record
                        </button>
                    ) : (
                        <button className="stop-btn pulse" onClick={stopRecording} style={{background: '#202223', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <Square size={16}/> Stop
                        </button>
                    )}
                    <span style={{fontSize: '11px', color: '#888'}}>OR</span>
                    <input type="file" accept="audio/*" onChange={handleManualVoiceUpload} style={{fontSize: '11px', width: '120px'}} />
                </div>

                {audioURL && (
                    <div style={{marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '5px', borderRadius: '5px', border: '1px solid #eee'}}>
                        <Play size={16} color="#008060" />
                        <audio src={audioURL} controls style={{height: '25px', width: '100%'}} />
                        <button onClick={clearAudio} style={{background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer'}}><Trash2 size={16}/></button>
                    </div>
                )}
            </div>

            <div className="custom-option">
                <label>🗣️ Narrator Selection:</label>
                <div className="radio-group">
                    <label><input type="radio" value="female" checked={voiceGender === 'female'} onChange={(e) => setVoiceGender(e.target.value)} /> 👩 Female</label>
                    <label><input type="radio" value="male" checked={voiceGender === 'male'} onChange={(e) => setVoiceGender(e.target.value)} /> 👨 Male</label>
                </div>
            </div>

            <div className="custom-option">
                <label>🎭 Script Tone:</label>
                <select value={scriptTone} onChange={(e) => setScriptTone(e.target.value)} className="custom-select">
                    <option value="Professional">Professional</option>
                    <option value="Excited">Excited (Viral Style)</option>
                    <option value="Luxury">Luxury (Elegant)</option>
                </select>
            </div>

            <div className="custom-option">
                <label>⏱️ Duration: <b>{duration}s</b></label>
                <input type="range" min="10" max="60" step="5" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="slider" />
            </div>

            <div className="custom-option">
                <label>🎨 Video Theme:</label>
                <select value={videoTheme} onChange={(e) => setVideoTheme(e.target.value)} className="custom-select">
                    <option value="Modern">Modern</option>
                    <option value="Dynamic">Dynamic</option>
                    <option value="Retro">Retro</option>
                </select>
            </div>

            <div className="custom-option">
                <label>🎵 Background Music:</label>
                <input type="file" accept="audio/*" onChange={(e) => setMusicFile(e.target.files[0])} className="file-input" />
            </div>

            <button className="generate-btn-large" onClick={handleGenerateClick} disabled={videoUsage >= 100} style={videoUsage >= 100 ? {background: '#999'} : {}}>
                {videoUsage >= 100 ? "Limit Reached" : "Generate Video"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
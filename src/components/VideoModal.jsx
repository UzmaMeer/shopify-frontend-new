import React, { useState, useEffect, useRef, useCallback } from 'react';
import './VideoModal.css';
import PublishModal from './PublishModal'; 
import { BACKEND_URL } from '../config'; // 🟢 IMPORT ADDED

const VideoModal = ({ 
  product, 
  shopName, 
  selectedImages, 
  onClose, 
  voiceGender, 
  duration, 
  scriptTone, 
  musicFile, 
  videoTheme 
}) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [status, setStatus] = useState("idle"); 
  const [progress, setProgress] = useState(0);   
  const [errorMsg, setErrorMsg] = useState("");
  const [currentJobId, setCurrentJobId] = useState(null);
  const [showSocialModal, setShowSocialModal] = useState(false);
  
  const hasCalledRef = useRef(false);
  const videoRef = useRef(null); 

  // 🟢 REMOVED HARDCODED BACKEND_URL (Uses import now)

  const handleMaximize = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
      else if (videoRef.current.webkitRequestFullscreen) videoRef.current.webkitRequestFullscreen();
    }
  };

  const shareToWhatsApp = () => {
    if (!videoUrl) return alert("No video generated yet!");
    const message = `Check out this AI Generated Video! 🚀\n${videoUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const pollStatus = useCallback((jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/check-status/${jobId}?t=${Date.now()}`, { // 🟢 USED HERE
           headers: { "ngrok-skip-browser-warning": "true" }
        });
        const data = await res.json();
        
        setProgress(data.progress || 0);
        
        if (data.status === "done") {
          clearInterval(interval);
          const fullVideoUrl = data.url.startsWith("http") ? data.url : `${BACKEND_URL}${data.url}`;
          setVideoUrl(fullVideoUrl);
          setStatus("done");
        } else if (data.status === "failed") {
          clearInterval(interval);
          setStatus("failed");
          setErrorMsg(data.error || "Generation failed.");
        } else {
          setStatus("processing");
        }
      } catch (e) {
        console.error("Polling error:", e);
        clearInterval(interval);
        setStatus("failed");
      }
    }, 1500); 
  }, []);

  const startVideoGeneration = useCallback(async () => {
    setStatus("queued");
    setProgress(0);

    const imagesToUse = (selectedImages && selectedImages.length > 0) 
        ? selectedImages 
        : (product.images ? product.images.map(img => img.src) : []);

    if (imagesToUse.length === 0) {
        setStatus("failed");
        setErrorMsg("No images selected or found for this product.");
        return;
    }
    
    try {
      const formData = new FormData();
      formData.append("image_urls", JSON.stringify(imagesToUse)); 
      formData.append("product_title", product.title);
      formData.append("product_desc", product.body_html || "");
      formData.append("duration", duration || 15);
      formData.append("voice_gender", voiceGender || "female");
      formData.append("script_tone", scriptTone || "Professional");
      formData.append("video_theme", videoTheme || "Modern");
      formData.append("shop_name", shopName || ""); 

      if (musicFile) {
        formData.append("music_file", musicFile);
      }

      const res = await fetch(`${BACKEND_URL}/api/start-video-generation`, { // 🟢 USED HERE
        method: 'POST',
        headers: { "ngrok-skip-browser-warning": "true" },
        body: formData 
      });

      const data = await res.json();
      
      if (data.status === "queued" || data.status === "processing") {
        setCurrentJobId(data.job_id);
        pollStatus(data.job_id); 
      } else {
        setStatus("failed");
        setErrorMsg("Failed to start rendering engine.");
      }
    } catch (e) {
      console.error(e);
      setStatus("failed");
      setErrorMsg("Backend server connection failed.");
    }
  }, [product, shopName, selectedImages, voiceGender, duration, scriptTone, musicFile, videoTheme, pollStatus]);

  useEffect(() => {
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;
    startVideoGeneration();
  }, [startVideoGeneration]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">Creating Video ({videoTheme} Style)</div>
          <div className="header-actions">
            {status === "done" && (
              <button className="maximize-btn" onClick={handleMaximize}>⛶</button>
            )}
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
        </div>

        <div className="video-preview-area">
          {(status === "queued" || status === "processing") && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p className="status-text">
                {status === "queued" ? "Analyzing Product..." : `Rendering Video: ${progress}%`}
              </p>
              <div className="progress-container">
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="error-state">
                <span className="error-icon">⚠️</span>
                <p>{errorMsg}</p>
            </div>
          )}

          {status === "done" && videoUrl && (
            <div className="video-container">
               <video ref={videoRef} controls autoPlay src={videoUrl} className="final-video" />
            </div>
          )}
        </div>

        <div className="modal-footer">
           {status === "done" ? (
             <div className="action-row">
                <button className="btn-action secondary" onClick={onClose}>Discard</button>
                <div className="right-actions">
                    <a href={videoUrl} download style={{textDecoration: 'none'}}>
                        <button className="btn-action">⬇️ Download</button>
                    </a>

                    <button className="btn-action" onClick={shareToWhatsApp} style={{backgroundColor: '#25D366', borderColor: '#25D366', color: 'white'}}>Share</button>

                    <button className="btn-action btn-primary" onClick={() => setShowSocialModal(true)}>🚀 Publish</button>
                </div>
             </div>
           ) : (
             <div className="action-row footer-right">
               <button className="btn-action secondary" onClick={onClose}>Cancel</button>
             </div>
           )}
        </div>
      </div>

      {showSocialModal && (
        <PublishModal 
          videoFilename={videoUrl?.split('/').pop()} 
          renderJobId={currentJobId} 
          onClose={() => setShowSocialModal(false)} 
        />
      )}
    </div>
  );
};

export default VideoModal;
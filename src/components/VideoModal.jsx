import React, { useState, useEffect, useRef, useCallback } from 'react';
import './VideoModal.css';
import PublishModal from './PublishModal'; 
import { BACKEND_URL } from '../config'; 
import { Maximize, Minimize, Play, Pause, Share2, Download, ShoppingBag } from 'lucide-react'; // 🟢 Added ShoppingBag Icon

const VideoModal = ({ 
  product, shopName, selectedImages, onClose, 
  voiceGender, duration, scriptTone, musicFile, videoTheme 
}) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [status, setStatus] = useState("idle"); 
  const [progress, setProgress] = useState(0);   
  const [errorMsg, setErrorMsg] = useState("");
  const [currentJobId, setCurrentJobId] = useState(null);
  const [showSocialModal, setShowSocialModal] = useState(false);
  
  // Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Downloading State
  const [isDownloading, setIsDownloading] = useState(false);

  // 🟢 NEW: Upload to Store State
  const [isUploadingToStore, setIsUploadingToStore] = useState(false);

  const hasCalledRef = useRef(false);
  const videoRef = useRef(null); 
  const containerRef = useRef(null);

  // --- 1. FORCE DOWNLOAD FUNCTION ---
  const handleDownload = async () => {
    if (!videoUrl) return;
    setIsDownloading(true);

    try {
      const response = await fetch(videoUrl, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = videoUrl.split('/').pop() || 'ad-video.mp4';
      
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Opening in new tab instead.");
      window.open(videoUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  // 🟢 NEW: HANDLE ADD TO STOREFRONT
  const handleAddToStore = async () => {
    if (!videoUrl) return;
    setIsUploadingToStore(true);
    
    const filename = videoUrl.split('/').pop(); // Extract "vid_xxxx.mp4"

    try {
        const res = await fetch(`${BACKEND_URL}/api/upload-to-storefront`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({
                shop: shopName,
                product_id: product.id,
                video_filename: filename
            })
        });
        const data = await res.json();
        
        if (data.status === 'success') {
            alert("✅ Video added to Product Gallery! Check your Storefront.");
        } else {
            alert("❌ Error: " + JSON.stringify(data));
        }
    } catch (e) {
        alert("❌ Network Error: Is the backend running?");
    } finally {
        setIsUploadingToStore(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if(videoRef.current.ended) setIsPlaying(false);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setVideoDuration(videoRef.current.duration);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const pollStatus = useCallback((jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/check-status/${jobId}?t=${Date.now()}`, {
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
        setStatus("failed"); setErrorMsg("No images selected."); return;
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
      if (musicFile) formData.append("music_file", musicFile);

      const res = await fetch(`${BACKEND_URL}/api/start-video-generation`, {
        method: 'POST',
        headers: { "ngrok-skip-browser-warning": "true" },
        body: formData 
      });
      const data = await res.json();
      if (data.status === "queued" || data.status === "processing") {
        setCurrentJobId(data.job_id); pollStatus(data.job_id); 
      } else {
        setStatus("failed"); setErrorMsg("Failed to start.");
      }
    } catch (e) { setStatus("failed"); setErrorMsg("Backend error."); }
  }, [product, shopName, selectedImages, voiceGender, duration, scriptTone, musicFile, videoTheme, pollStatus]);

  useEffect(() => {
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;
    startVideoGeneration();
  }, [startVideoGeneration]);

  return (
    <div className="modal-overlay">
      <div ref={containerRef} className={`modal-content ${isFullscreen ? 'fullscreen-mode' : ''}`}>
        
        {!isFullscreen && (
            <div className="modal-header">
            <div className="modal-title">Creating Video ({videoTheme})</div>
            <button className="close-btn" onClick={onClose}>&times;</button>
            </div>
        )}

        <div className="video-preview-area">
          {(status === "queued" || status === "processing") && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p className="status-text">{status === "queued" ? "Analyzing..." : `Rendering: ${progress}%`}</p>
              <div className="progress-container">
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="error-state"><span className="error-icon">⚠️</span><p>{errorMsg}</p></div>
          )}

          {status === "done" && videoUrl && (
            <div className="video-container" onClick={togglePlay}>
               <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  src={videoUrl} 
                  className="final-video"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
               />

               <div className="custom-controls" onClick={(e) => e.stopPropagation()}>
                  <button className="ctrl-btn" onClick={togglePlay}>
                    {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                  </button>
                  
                  <input 
                    type="range" 
                    min="0" 
                    max={videoDuration} 
                    value={currentTime} 
                    onChange={handleSeek}
                    className="video-scrubber"
                  />

                  <div className="right-ctrls">
                    <span className="time-text">
                        {Math.floor(currentTime)}s / {Math.floor(videoDuration)}s
                    </span>
                    <button className="ctrl-btn" onClick={toggleFullscreen}>
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>

        {!isFullscreen && (
            <div className="modal-footer">
            {status === "done" ? (
                <div className="action-row">
                    <button className="btn-action secondary" onClick={onClose}>Discard</button>
                    <div className="right-actions">
                        <button className="btn-action" onClick={handleDownload} disabled={isDownloading}>
                            <Download size={16}/> {isDownloading ? "Saving..." : "Download"}
                        </button>

                        {/* 🟢 NEW: Add to Store Button */}
                        <button 
                            className="btn-action" 
                            onClick={handleAddToStore} 
                            disabled={isUploadingToStore} 
                            style={{background: '#f4f4f4', border: '1px solid #ccc', color: '#333'}}
                        >
                           <ShoppingBag size={16}/> {isUploadingToStore ? "Uploading..." : "Add to Store"}
                        </button>

                        <button className="btn-action btn-primary" onClick={() => setShowSocialModal(true)}>
                            <Share2 size={16} /> Publish
                        </button>
                    </div>
                </div>
            ) : (
                <div className="action-row footer-right">
                <button className="btn-action secondary" onClick={onClose}>Cancel</button>
                </div>
            )}
            </div>
        )}
      </div>

      {showSocialModal && (
        <PublishModal videoFilename={videoUrl?.split('/').pop()} renderJobId={currentJobId} onClose={() => setShowSocialModal(false)} />
      )}
    </div>
  );
};

export default VideoModal;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Box,
  Icon,
  Banner,
  ProgressBar,
  Spinner,
  ButtonGroup
  // 🟢 FIX 2: Removed unused 'Tooltip' from imports
} from '@shopify/polaris';
import {
  MaximizeIcon,
  MinimizeIcon,
  PlayIcon,
  PauseCircleIcon,
  ShareIcon,
  SaveIcon, 
  CartIcon, 
  ChatIcon
  // 🟢 FIX 3: Removed unused 'XIcon' from imports
} from '@shopify/polaris-icons';

import PublishModal from './PublishModal'; 
import { BACKEND_URL } from '../config'; 

const VideoModal = ({ 
  product, shopName, selectedImages, onClose, 
  voiceGender, duration, scriptTone, musicFile, videoTheme,
  customScript, userVoiceFile 
}) => {
  // --- STATE ---
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
  
  // Loading & Action States
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploadingToStore, setIsUploadingToStore] = useState(false);

  const hasCalledRef = useRef(false);
  const videoRef = useRef(null); 
  
  // --- 1. ACTIONS ---

  const handleWhatsAppShare = () => {
    if (!videoUrl) return;
    const shareText = `Check out this product video for ${product.title}: ${videoUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownload = async () => {
    if (!videoUrl) return;
    setIsDownloading(true);
    try {
      const response = await fetch(videoUrl, { headers: { "ngrok-skip-browser-warning": "true" } });
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
      window.open(videoUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAddToStore = async () => {
    if (!videoUrl) return;
    setIsUploadingToStore(true);
    const filename = videoUrl.split('/').pop(); 
    try {
        const res = await fetch(`${BACKEND_URL}/api/upload-to-storefront`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({
                shop: shopName,
                product_id: product.id,
                product_title: product.title,
                video_filename: filename
            })
        });
        const data = await res.json();
        if (data.status === 'success') {
            alert("✅ Video added to Product Gallery!");
        } else {
            alert("❌ Error: " + JSON.stringify(data));
        }
    } catch (e) {
        alert("❌ Network Error.");
    } finally {
        setIsUploadingToStore(false);
    }
  };

  // --- 2. PLAYER CONTROLS ---
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
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

  // --- 3. GENERATION & POLLING LOGIC ---
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

      // 🟢 CUSTOM FIELDS
      if (customScript) formData.append("custom_script", customScript);
      if (userVoiceFile) formData.append("user_voice_audio", userVoiceFile);
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
  }, [product, shopName, selectedImages, voiceGender, duration, scriptTone, musicFile, videoTheme, customScript, userVoiceFile, pollStatus]);

  useEffect(() => {
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;
    startVideoGeneration();
  }, [startVideoGeneration]);

  // --- RENDER ---
  return (
    <>
      {showSocialModal && (
        <PublishModal 
            renderJobId={currentJobId} 
            isProcessing={status !== 'done'}
            productId={product.id} 
            onClose={() => setShowSocialModal(false)} 
        />
      )}

      <div style={{display: showSocialModal ? 'none' : 'block'}}>
        <Modal
            open={true}
            onClose={onClose}
            title={`Creating Video (${videoTheme})`}
            size="large"
            primaryAction={status === "done" ? {
                content: 'Publish Video',
                onAction: () => setShowSocialModal(true),
                icon: ShareIcon,
            } : undefined}
            secondaryActions={[
                {
                    content: status === "done" ? 'Discard' : 'Cancel',
                    onAction: onClose,
                },
            ]}
        >
            <Modal.Section>
            <BlockStack gap="500">
                
                {/* 1. LOADING STATE */}
                {(status === "queued" || status === "processing") && (
                    <Box padding="800">
                        <BlockStack gap="400" align="center" inlineAlign="center">
                            <Spinner size="large" accessibilityLabel="Generating video" />
                            <Text variant="headingMd" as="h3">
                                {status === "queued" ? "Analyzing Product Data..." : `Rendering Video: ${progress}%`}
                            </Text>
                            <div style={{width: '100%', maxWidth: '400px'}}>
                                <ProgressBar progress={progress} size="small" tone="primary" />
                            </div>
                        </BlockStack>
                    </Box>
                )}

                {/* 2. ERROR STATE */}
                {status === "failed" && (
                    <Banner tone="critical" title="Generation Failed">
                        <p>{errorMsg || "Something went wrong. Please try again."}</p>
                    </Banner>
                )}

                {/* 3. SUCCESS / PLAYER STATE */}
                {status === "done" && videoUrl && (
                    <BlockStack gap="400">
                        {/* VIDEO PLAYER CONTAINER */}
                        <div 
                            style={{
                                position: 'relative', 
                                width: '100%', 
                                aspectRatio: '16/9', 
                                background: 'black', 
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}
                        >
                            <video 
                                ref={videoRef} 
                                src={videoUrl}
                                autoPlay 
                                playsInline
                                style={{width: '100%', height: '100%', objectFit: 'contain'}}
                                onTimeUpdate={handleTimeUpdate} 
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={() => setIsPlaying(false)}
                                onClick={togglePlay}
                            />
                            
                            {/* CUSTOM CONTROLS OVERLAY */}
                            <div style={{
                                position: 'absolute', 
                                bottom: 0, left: 0, right: 0, 
                                padding: '10px 20px', 
                                background: 'rgba(0,0,0,0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                color: 'white'
                            }}>
                                <div onClick={togglePlay} style={{cursor:'pointer'}}>
                                    <Icon source={isPlaying ? PauseCircleIcon : PlayIcon} tone="base" />
                                </div>
                                
                                <input 
                                    type="range" 
                                    min="0" 
                                    max={videoDuration} 
                                    value={currentTime} 
                                    onChange={handleSeek} 
                                    style={{flex: 1, cursor: 'pointer'}} 
                                />
                                
                                <Text variant="bodySm" as="span" tone="textInverse">
                                    {Math.floor(currentTime)}s / {Math.floor(videoDuration)}s
                                </Text>

                                <div onClick={toggleFullscreen} style={{cursor:'pointer'}}>
                                    <Icon source={isFullscreen ? MinimizeIcon : MaximizeIcon} tone="base" />
                                </div>
                            </div>
                        </div>

                        {/* ACTION BUTTONS ROW */}
                        <InlineStack align="center" gap="300">
                            <ButtonGroup>
                                <Button icon={SaveIcon} onClick={handleDownload} loading={isDownloading}>Download</Button>
                                <Button icon={CartIcon} onClick={handleAddToStore} loading={isUploadingToStore}>Add to Gallery</Button>
                                <Button icon={ChatIcon} onClick={handleWhatsAppShare} tone="success">WhatsApp</Button>
                            </ButtonGroup>
                        </InlineStack>

                    </BlockStack>
                )}
            </BlockStack>
            </Modal.Section>
        </Modal>
      </div>
    </>
  );
};

export default VideoModal;
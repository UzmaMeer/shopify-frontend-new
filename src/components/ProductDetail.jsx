import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  TextField,
  Select,
  RangeSlider,
  ChoiceList,
  ProgressBar,
  Banner,
  BlockStack,
  InlineStack,
  Box,
  Icon,
  DropZone
  // 🟢 REMOVED: 'Thumbnail', 'LegacyStack' (Not used)
} from '@shopify/polaris';
import {
  MicrophoneIcon,
  StopCircleIcon,
  DeleteIcon,
  PlayIcon,
  MagicIcon,
  AlertCircleIcon,
  CheckCircleIcon
  // 🟢 REMOVED: 'NoteIcon' (Not used)
} from '@shopify/polaris-icons';

import VideoModal from './VideoModal';
import { BACKEND_URL } from '../config';

const ProductDetail = ({ productId, shopName, onBack }) => {
  // --- STATE ---
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Usage Tracking
  const [videoUsage, setVideoUsage] = useState(0);

  // Generation Form State
  const [selectedVideoImages, setSelectedVideoImages] = useState([]);
  const [voiceGender, setVoiceGender] = useState(['female']); // ChoiceList uses array
  const [duration, setDuration] = useState(15);
  const [scriptTone, setScriptTone] = useState('Professional');
  const [videoTheme, setVideoTheme] = useState('Modern');
  const [musicFile, setMusicFile] = useState(null);
  const [customScript, setCustomScript] = useState('');

  // Audio Recording State
  const [userVoiceFile, setUserVoiceFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const maxImagesAllowed = Math.floor(duration / 3);

  // --- FETCH DATA ---
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
        
        // Auto-Auth Fix (Consistency)
        if (response.status === 401) {
            window.top.location.href = `${BACKEND_URL}/api/auth?shop=${shopName}&force_auth=true`;
            return;
        }

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

  // Fetch Usage
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

  // --- RECORDING LOGIC ---
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

  const clearAudio = () => {
    setUserVoiceFile(null);
    setAudioURL(null);
  };

  // --- FILE HANDLING (DropZone) ---
  const handleMusicDrop = useCallback((_droppedFiles, acceptedFiles) => {
    setMusicFile(acceptedFiles[0]);
  }, []);

  const handleVoiceUpload = useCallback((_droppedFiles, acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
          setUserVoiceFile(file);
          setAudioURL(URL.createObjectURL(file));
      }
  }, []);

  // --- IMAGE SELECTION ---
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
    if (videoUsage >= 100) return; 
    if (selectedVideoImages.length === 0) return alert("⚠️ Please select at least 1 image!");
    setShowVideoModal(true);
  };

  // --- OPTIONS ---
  const toneOptions = [
      {label: 'Professional', value: 'Professional'},
      {label: 'Excited (Viral)', value: 'Excited'},
      {label: 'Luxury (Elegant)', value: 'Luxury'},
  ];

  const themeOptions = [
      {label: 'Modern', value: 'Modern'},
      {label: 'Dynamic', value: 'Dynamic'},
      {label: 'Retro', value: 'Retro'},
  ];

  if (loading) return <Page><Layout><Layout.Section><Card><div style={{padding:'20px'}}>Loading...</div></Card></Layout.Section></Layout></Page>;
  if (!product) return <Page><Layout><Layout.Section><Banner tone="critical">Product not found</Banner></Layout.Section></Layout></Page>;

  const price = product.variants && product.variants[0] ? product.variants[0].price : '0.00';

  return (
    <Page
        title={product.title}
        subtitle={`PKR ${price}`}
        backAction={{content: 'Products', onAction: onBack}}
        primaryAction={{
            content: 'Generate Video',
            onAction: handleGenerateClick,
            disabled: videoUsage >= 100,
            icon: MagicIcon
        }}
    >
      {/* RENDER MODAL IF ACTIVE */}
      {showVideoModal && (
        <VideoModal 
          product={product} shopName={shopName} selectedImages={selectedVideoImages}
          voiceGender={voiceGender[0]} duration={duration} scriptTone={scriptTone}
          videoTheme={videoTheme} musicFile={musicFile} customScript={customScript}
          userVoiceFile={userVoiceFile} onClose={() => setShowVideoModal(false)} 
        />
      )}

      <Layout>
        {/* LEFT COLUMN: IMAGES */}
        <Layout.Section>
            <Card>
                <BlockStack gap="400">
                    <div style={{height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f4f4f4', borderRadius: '8px', overflow: 'hidden'}}>
                        <img 
                            src={selectedImage || 'https://via.placeholder.com/600'} 
                            alt="Main product" 
                            style={{maxHeight: '100%', maxWidth: '100%', objectFit: 'contain'}} 
                        />
                    </div>
                    
                    <Text variant="bodyMd" fontWeight="bold">Select Images for Video ({selectedVideoImages.length}/{maxImagesAllowed})</Text>
                    
                    <InlineStack gap="200" wrap>
                        {product.images?.map((img) => {
                            const isSelected = selectedVideoImages.includes(img.src);
                            return (
                                <div 
                                    key={img.id} 
                                    onClick={() => toggleImageSelection(img.src)}
                                    style={{
                                        border: isSelected ? '3px solid #008060' : '1px solid #dfe3e8',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        opacity: isSelected ? 1 : 0.6,
                                        width: '80px',
                                        height: '80px',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <img src={img.src} alt="thumb" style={{width:'100%', height:'100%', objectFit:'cover'}} onClick={(e) => {e.stopPropagation(); setSelectedImage(img.src); toggleImageSelection(img.src);}} />
                                    {isSelected && (
                                        <div style={{position:'absolute', top:2, right:2, background:'white', borderRadius:'50%'}}>
                                            <Icon source={CheckCircleIcon} tone="success"/>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </InlineStack>
                </BlockStack>
            </Card>
        </Layout.Section>

        {/* RIGHT COLUMN: CONTROLS */}
        <Layout.Section variant="oneThird">
            <BlockStack gap="500">
                
                {/* 1. USAGE TRACKER */}
                <Card>
                    <BlockStack gap="200">
                        <InlineStack align="space-between">
                            <Text variant="headingSm" as="h5">✨ AI Credits</Text>
                            <Text tone={videoUsage >= 100 ? 'critical' : 'success'}>{videoUsage}/100 Used</Text>
                        </InlineStack>
                        <ProgressBar progress={videoUsage} tone={videoUsage >= 100 ? 'critical' : 'success'} size="small"/>
                        {videoUsage >= 100 && <Banner tone="critical" icon={AlertCircleIcon}><p>Upgrade plan to generate more.</p></Banner>}
                    </BlockStack>
                </Card>

                {/* 2. GENERATION CONTROLS */}
                <Card>
                    <BlockStack gap="400">
                        <Text variant="headingMd" as="h2">Video Settings</Text>
                        
                        <TextField
                            label="Custom Script (Optional)"
                            value={customScript}
                            onChange={(val) => setCustomScript(val)}
                            multiline={3}
                            placeholder="Type specific instructions..."
                            autoComplete="off"
                        />

                        <ChoiceList
                            title="Narrator Voice"
                            choices={[
                                {label: '👩 Female Voice', value: 'female'},
                                {label: '👨 Male Voice', value: 'male'},
                            ]}
                            selected={voiceGender}
                            onChange={(val) => setVoiceGender(val)}
                        />

                        {/* AUDIO RECORDER SECTION */}
                        <Box padding="300" background="bg-surface-secondary" borderRadius="200">
                            <BlockStack gap="300">
                                <Text fontWeight="bold">🎙️ Add Your Voice</Text>
                                <InlineStack gap="200">
                                    {!isRecording ? (
                                        <Button icon={MicrophoneIcon} onClick={startRecording}>Record</Button>
                                    ) : (
                                        <Button icon={StopCircleIcon} onClick={stopRecording} tone="critical">Stop</Button>
                                    )}
                                    <div style={{width: '100px'}}>
                                        <DropZone onDrop={handleVoiceUpload} allowMultiple={false} label="Upload Audio">
                                            <DropZone.FileUpload actionTitle="Upload File" />
                                        </DropZone>
                                    </div>
                                </InlineStack>

                                {audioURL && (
                                    <InlineStack gap="200" align="center" blockAlign="center">
                                        <div style={{background: 'white', borderRadius: '20px', padding: '5px 10px', flex: 1, display: 'flex', alignItems: 'center'}}>
                                            <Icon source={PlayIcon} tone="success"/>
                                            <audio src={audioURL} controls style={{height: '20px', width: '100%', marginLeft: '5px'}} />
                                        </div>
                                        <Button icon={DeleteIcon} onClick={clearAudio} tone="critical" plain />
                                    </InlineStack>
                                )}
                            </BlockStack>
                        </Box>

                        <Select
                            label="Script Tone"
                            options={toneOptions}
                            onChange={(val) => setScriptTone(val)}
                            value={scriptTone}
                        />

                        <RangeSlider
                            label={`Duration: ${duration}s`}
                            value={duration}
                            onChange={(val) => setDuration(val)}
                            min={10}
                            max={60}
                            step={5}
                            output
                        />

                        <Select
                            label="Video Theme"
                            options={themeOptions}
                            onChange={(val) => setVideoTheme(val)}
                            value={videoTheme}
                        />

                        <Box>
                            <Text variant="bodyMd" as="p" fontWeight="medium">Background Music</Text>
                            <div style={{marginTop: '5px'}}>
                                <DropZone onDrop={handleMusicDrop} allowMultiple={false} variableHeight>
                                    {musicFile ? (
                                        <DropZone.FileUpload actionTitle="Change Music" />
                                    ) : (
                                        <DropZone.FileUpload actionHint="Accepts .mp3, .wav" />
                                    )}
                                </DropZone>
                            </div>
                            {musicFile && <Text tone="success" variant="bodySm">Selected: {musicFile.name}</Text>}
                        </Box>

                        <Button 
                            fullWidth 
                            variant="primary" 
                            size="large" 
                            icon={MagicIcon} 
                            onClick={handleGenerateClick}
                            disabled={videoUsage >= 100}
                        >
                            Generate Video
                        </Button>

                    </BlockStack>
                </Card>
            </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default ProductDetail;
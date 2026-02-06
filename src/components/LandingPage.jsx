import React, { useState, useEffect } from 'react';
import { 
    Page, Layout, Card, Button, Text, Grid, Modal, 
    TextField, Banner, MediaCard, BlockStack, InlineStack, Icon 
} from '@shopify/polaris';
import { StoreIcon, CheckCircleIcon, LockIcon, StarFilledIcon } from '@shopify/polaris-icons';

// 🟢 1. STATIC REVIEWS
const STATIC_REVIEWS = [
    { name: "Sarah K.", rating: 5, comment: "Sales increased by 30% after using these videos!", designation: "Fashion Store Owner" },
    { name: "Ali Raza", rating: 5, comment: "Best tool for Shopify. Saves me hours of editing.", designation: "Gadget Shop" },
    { name: "Zara M.", rating: 4, comment: "Templates are very professional. Highly recommended.", designation: "Decor Brand" },
    { name: "Usman T.", rating: 5, comment: "My TikTok ads are finally performing well.", designation: "Dropshipper" },
];

const LandingPage = ({ shopName, setShopName, backendUrl, handleInstall }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [reviews, setReviews] = useState(STATIC_REVIEWS);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '', designation: 'Store Owner' });
  const [previewTemplate, setPreviewTemplate] = useState(null); 
  const [showPlanSelection, setShowPlanSelection] = useState(false);

  // 🟢 SMART CHECK: Is the app already installed in this browser?
  const savedShop = localStorage.getItem('shopName');
  // If we have a saved shop, we assume it's "Installed" and just needs to be "Opened"
  const isReturningUser = !!savedShop && savedShop.length > 0;

  // 🟢 2. TEMPLATES CONFIGURATION
  const templates = [
    { id: 'luxury', title: 'Royal Minimalist', category: 'Luxury', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80', config: { tone: 'Luxury', theme: 'Cinematic', voice: 'female' } },
    { id: 'sale', title: 'Flash Impact', category: 'Sale', img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&q=80', config: { tone: 'Urgent', theme: 'Modern', voice: 'male' } },
    { id: 'kids', title: 'Kids & Play', category: 'Kids', img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80', config: { tone: 'Funny', theme: 'Dynamic', voice: 'female' } },
    { id: 'story', title: 'Storyteller', category: 'General', img: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=400&q=80', config: { tone: 'Professional', theme: 'Modern', voice: 'male' } },
    { id: 'winter', title: 'Festive Season', category: 'Holiday', img: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=400&q=80', config: { tone: 'Excited', theme: 'Cinematic', voice: 'female' } }
  ];

  // 🟢 3. FETCH REVIEWS
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
    
    // Auto-fill shop name if returning
    if(savedShop) {
        setShopName(savedShop);
    }
  }, [backendUrl, savedShop, setShopName]);

  // 🟢 4. HANDLERS
  const handleMainButtonClick = () => {
      if (isReturningUser) {
          // OPEN APP LOGIC: Skip plans, just log them in
          handleInstall(); // This calls the parent's login handler immediately
      } else {
          // INSTALL APP LOGIC: Show Plan Modal first
          if (shopName && !shopName.includes('.myshopify.com') && !shopName.includes('.')) {
             setShopName(`${shopName}.myshopify.com`);
          }
          setShowPlanSelection(true); 
      }
  };

  const confirmPlanAndInstall = () => {
    setShowPlanSelection(false);
    const API_BASE = "https://snakiest-edward-autochthonously.ngrok-free.dev"; 
    const authUrl = shopName ? `${API_BASE}/api/auth?shop=${shopName}` : `${API_BASE}/api/auth`; 
    window.location.href = authUrl; 
  };

  const handleTemplateClick = (template) => setPreviewTemplate(template);

  const confirmTemplateSelection = () => {
    if (!previewTemplate) return;
    setSelectedTemplate(previewTemplate.id);
    localStorage.setItem('selectedTemplateConfig', JSON.stringify(previewTemplate.config));
    setPreviewTemplate(null); 
  };

  const submitReview = async () => {
    const API_URL = backendUrl || "http://localhost:8000";
    try {
      await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      alert("Review submitted!");
      setReviews([...reviews, newReview]); 
      setShowReviewModal(false);
    } catch (e) { alert("Error submitting review."); }
  };

  return (
    <div style={{background: '#f6f6f7', minHeight: '100vh', paddingBottom: '50px'}}>
      {/* HEADER BANNER */}
      <div style={{background: '#008060', padding: '15px 20px', display: 'flex', alignItems: 'center', color: 'white'}}>
        <img src="https://cdn-icons-png.flaticon.com/512/154/154859.png" width="24" alt="logo" style={{marginRight: 10}}/>
        <Text variant="headingMd" as="h2" tone="textInverse">Shopify App Store</Text>
      </div>

      <Page fullWidth>
        <Layout>
          {/* LEFT SIDEBAR - APP INFO */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
                <Card>
                    <BlockStack gap="400">
                        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                            <div style={{fontSize: '30px', background: '#f1f8f5', padding: '15px', borderRadius: '10px'}}>▶</div>
                            <div>
                                <Text variant="headingXl" as="h1">VideoAI Maker</Text>
                                <Text variant="bodyMd" tone="subdued">★ 4.9 (500+ Reviews)</Text>
                            </div>
                        </div>
                        
                        {/* 🟢 SMART BUTTON LOGIC */}
                        <Button 
                            fullWidth 
                            variant="primary" 
                            size="large" 
                            onClick={handleMainButtonClick}
                        >
                            {isReturningUser ? "Open App" : "Install App"}
                        </Button>
                        
                        {/* REMOVED: "Free Plan Available" text */}
                    </BlockStack>
                </Card>

                {/* 🟢 HIDE INPUT IF RETURNING USER */}
                {!isReturningUser && (
                    <Card>
                        <BlockStack gap="200">
                            <Text variant="headingSm" as="h3">Store URL (Optional)</Text>
                            <TextField 
                                value={shopName}
                                onChange={(val) => setShopName(val)}
                                placeholder="store.myshopify.com"
                                autoComplete="off"
                                prefix={<Icon source={StoreIcon} />}
                            />
                        </BlockStack>
                    </Card>
                )}
            </BlockStack>
          </Layout.Section>

          {/* RIGHT CONTENT */}
          <Layout.Section>
            <BlockStack gap="600">
                
                {/* HERO BANNER */}
                <MediaCard
                    title="Create Viral Ads in Seconds"
                    primaryAction={{
                        content: isReturningUser ? 'Open App' : 'Install Now',
                        onAction: handleMainButtonClick,
                    }}
                    description="Turn static images into high-converting video ads automatically using our AI engine."
                    popoverActions={[{content: 'Dismiss', onAction: () => {}}]}
                >
                    <img
                        alt="Hero Banner"
                        width="100%"
                        height="100%"
                        style={{ objectFit: 'cover', objectPosition: 'center', maxHeight: '300px' }}
                        src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80"
                    />
                </MediaCard>

                {/* TEMPLATES GRID */}
                <BlockStack gap="400">
                    <Text variant="headingLg" as="h2">Choose a Style</Text>
                    <Grid>
                        {templates.map((temp) => (
                            <Grid.Cell key={temp.id} columnSpan={{xs: 6, sm: 6, md: 3, lg: 3, xl: 3}}>
                                <div 
                                    onClick={() => handleTemplateClick(temp)}
                                    style={{
                                        cursor: 'pointer', 
                                        borderRadius: '8px', 
                                        overflow: 'hidden', 
                                        border: selectedTemplate === temp.id ? '2px solid #008060' : '1px solid #dfe3e8',
                                        position: 'relative'
                                    }}
                                >
                                    <img src={temp.img} alt={temp.title} style={{width: '100%', height: '150px', objectFit: 'cover'}} />
                                    <div style={{padding: '10px', background: 'white'}}>
                                        <Text variant="headingSm" as="h4">{temp.title}</Text>
                                        <Text variant="bodyXs" tone="subdued">{temp.category}</Text>
                                    </div>
                                    {selectedTemplate === temp.id && (
                                        <div style={{position:'absolute', top: 5, right: 5, background:'#008060', color:'white', padding:'2px 6px', borderRadius:'4px', fontSize:'10px'}}>Selected</div>
                                    )}
                                </div>
                            </Grid.Cell>
                        ))}
                    </Grid>
                </BlockStack>

                {/* PRICING */}
                <BlockStack gap="400">
                    <Text variant="headingLg" as="h2" alignment="center">Simple Pricing</Text>
                    <Grid>
                        {/* BASIC PLAN */}
                        <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 4, lg: 4, xl: 4}}>
                            <Card>
                                <BlockStack gap="400">
                                    <Text variant="headingMd" as="h3" tone="success">BASIC PLAN</Text>
                                    <Text variant="heading3xl" as="p">$0 <span style={{fontSize:'16px', color:'#6d7175'}}>/mo</span></Text>
                                    <BlockStack gap="200">
                                        <InlineStack gap="200"><Icon source={CheckCircleIcon} tone="success"/><Text>10 Video Generations</Text></InlineStack>
                                        <InlineStack gap="200"><Icon source={CheckCircleIcon} tone="success"/><Text>All AI Voices</Text></InlineStack>
                                    </BlockStack>
                                    <Button fullWidth variant="primary" onClick={handleMainButtonClick}>Get Started</Button>
                                </BlockStack>
                            </Card>
                        </Grid.Cell>

                        {/* STANDARD PLAN (LOCKED) */}
                        <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 4, lg: 4, xl: 4}}>
                            <div style={{opacity: 0.6}}>
                                <Card>
                                    <BlockStack gap="400">
                                        <Text variant="headingMd" as="h3">STANDARD PLAN</Text>
                                        <Text variant="heading3xl" as="p">$49 <span style={{fontSize:'16px', color:'#6d7175'}}>/mo</span></Text>
                                        <BlockStack gap="200">
                                            <InlineStack gap="200"><Icon source={LockIcon} tone="subdued"/><Text tone="subdued">50 Videos</Text></InlineStack>
                                            <InlineStack gap="200"><Icon source={LockIcon} tone="subdued"/><Text tone="subdued">4K Resolution</Text></InlineStack>
                                        </BlockStack>
                                        <Button fullWidth disabled>Coming Soon</Button>
                                    </BlockStack>
                                </Card>
                            </div>
                        </Grid.Cell>

                        {/* PREMIUM PLAN (LOCKED) */}
                        <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 4, lg: 4, xl: 4}}>
                            <div style={{opacity: 0.6}}>
                                <Card>
                                    <BlockStack gap="400">
                                        <Text variant="headingMd" as="h3">PREMIUM PLAN</Text>
                                        <Text variant="heading3xl" as="p">$99 <span style={{fontSize:'16px', color:'#6d7175'}}>/mo</span></Text>
                                        <BlockStack gap="200">
                                            <InlineStack gap="200"><Icon source={LockIcon} tone="subdued"/><Text tone="subdued">Unlimited</Text></InlineStack>
                                            <InlineStack gap="200"><Icon source={LockIcon} tone="subdued"/><Text tone="subdued">Dedicated Studio</Text></InlineStack>
                                        </BlockStack>
                                        <Button fullWidth disabled>Coming Soon</Button>
                                    </BlockStack>
                                </Card>
                            </div>
                        </Grid.Cell>
                    </Grid>
                </BlockStack>

                {/* REVIEWS */}
                <BlockStack gap="400">
                    <InlineStack align="space-between">
                         <Text variant="headingLg" as="h2">Trusted by Merchants</Text>
                         <Button plain onClick={() => setShowReviewModal(true)}>+ Write a Review</Button>
                    </InlineStack>
                    
                    <Grid>
                        {reviews.map((rev, index) => (
                            <Grid.Cell key={index} columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
                                <Card>
                                    <BlockStack gap="200">
                                        <InlineStack gap="300" align="start">
                                            <div style={{background: '#f1f2f4', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                                                {rev.name ? rev.name.charAt(0) : 'U'}
                                            </div>
                                            <div>
                                                <Text variant="headingSm" as="h4">{rev.name}</Text>
                                                <Text variant="bodyXs" tone="subdued">{rev.designation}</Text>
                                            </div>
                                        </InlineStack>
                                        <InlineStack gap="100">
                                            {[...Array(5)].map((_, i) => (
                                                <Icon key={i} source={StarFilledIcon} tone={i < rev.rating ? 'warning' : 'subdued'} />
                                            ))}
                                        </InlineStack>
                                        <Text variant="bodyMd" as="p">"{rev.comment}"</Text>
                                    </BlockStack>
                                </Card>
                            </Grid.Cell>
                        ))}
                    </Grid>
                </BlockStack>

            </BlockStack>
          </Layout.Section>
        </Layout>
      </Page>

      {/* MODALS */}
      <Modal
        open={showPlanSelection}
        onClose={() => setShowPlanSelection(false)}
        title="Professional Installation"
        primaryAction={{ content: 'Confirm & Install', onAction: confirmPlanAndInstall }}
        secondaryActions={[{ content: 'Cancel', onAction: () => setShowPlanSelection(false) }]}
      >
        <Modal.Section>
            <Banner tone="warning">
                <p>Acknowledgment of the Basic Plan limit (10 videos/mo) is required to proceed.</p>
            </Banner>
            <div style={{marginTop: '20px'}}>
                <Text variant="headingSm" as="h4">You selected: Basic Plan (Free)</Text>
                <p>Clicking confirm will redirect you to Shopify Authorization.</p>
            </div>
        </Modal.Section>
      </Modal>

      <Modal
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        title={previewTemplate?.title}
        primaryAction={{ content: 'Use This Template', onAction: confirmTemplateSelection }}
        secondaryActions={[{ content: 'Close', onAction: () => setPreviewTemplate(null) }]}
      >
        <Modal.Section>
            {previewTemplate && (
                <div style={{textAlign: 'center'}}>
                    <img src={previewTemplate.img} alt="Preview" style={{maxWidth: '100%', borderRadius: '8px', maxHeight: '300px'}} />
                    <div style={{marginTop: '20px', textAlign: 'left'}}>
                        <Text variant="headingSm" as="h4">Configuration:</Text>
                        <ul>
                            <li>Tone: {previewTemplate.config.tone}</li>
                            <li>Theme: {previewTemplate.config.theme}</li>
                        </ul>
                    </div>
                </div>
            )}
        </Modal.Section>
      </Modal>

      <Modal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Write a Review"
        primaryAction={{ content: 'Submit Review', onAction: submitReview }}
        secondaryActions={[{ content: 'Cancel', onAction: () => setShowReviewModal(false) }]}
      >
        <Modal.Section>
            <BlockStack gap="400">
                <TextField label="Your Name" value={newReview.name} onChange={(val) => setNewReview({...newReview, name: val})} autoComplete="name"/>
                <TextField label="Rating (1-5)" type="number" value={newReview.rating} onChange={(val) => setNewReview({...newReview, rating: Number(val)})} autoComplete="off"/>
                <TextField label="Your Experience" value={newReview.comment} onChange={(val) => setNewReview({...newReview, comment: val})} multiline={3} autoComplete="off"/>
            </BlockStack>
        </Modal.Section>
      </Modal>
      
    </div>
  );
};

export default LandingPage;
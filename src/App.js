import React, { useState, useEffect, useCallback } from 'react';
import { Frame, Navigation, TopBar } from '@shopify/polaris';
// 🟢 FIXED: Replaced 'LogOutIcon' with 'ExitIcon'
import { HomeIcon, PaintBrushFlatIcon, ExitIcon } from '@shopify/polaris-icons';
import LandingPage from './components/LandingPage';
import ProductPage from './components/ProductPage'; 
import ProductDetail from './components/ProductDetail'; 
import BrandKitModal from './components/BrandKitModal'; 

const App = () => {
  // --- STATE MANAGEMENT ---
  const [shopName, setShopName] = useState(() => localStorage.getItem('shopName') || '');
  
  const [isInstalled, setIsInstalled] = useState(() => {
      return localStorage.getItem('isInstalled') === 'true';
  });

  const [activeTab, setActiveTab] = useState(() => {
      return localStorage.getItem('activeTab') || 'products';
  });

  const [selectedProductId, setSelectedProductId] = useState(() => {
      const savedId = localStorage.getItem('selectedProductId');
      return (savedId && savedId !== 'null' && savedId !== 'undefined') ? savedId : null;
  });

  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);
  const [showBrandKit, setShowBrandKit] = useState(false);

  // --- EFFECT 1: Handle URL Params ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get('shop');
    if (shop) {
      setShopName(shop);
      setIsInstalled(true);
    }
  }, []);

  // --- EFFECT 2: Auto-Save ---
  useEffect(() => {
      localStorage.setItem('shopName', shopName);
      localStorage.setItem('isInstalled', isInstalled);
      localStorage.setItem('activeTab', activeTab);
      localStorage.setItem('selectedProductId', selectedProductId);
  }, [shopName, isInstalled, activeTab, selectedProductId]);

  // --- HANDLERS ---
  const handleLoginSubmit = (enteredShopName) => {
    if (!enteredShopName) return alert("Please enter store domain");
    let cleanShop = enteredShopName.trim();
    if (!cleanShop.includes(".myshopify.com")) {
      cleanShop += ".myshopify.com";
    }
    setShopName(cleanShop);
    setIsInstalled(true);
  };

  const handleDisconnect = useCallback(() => {
    if (window.confirm("Are you sure you want to disconnect your store?")) {
        setIsInstalled(false);
        setShopName('');
        setSelectedProductId(null);
        setActiveTab('products');
        localStorage.clear();
    }
  }, []);

  const toggleMobileNavigation = useCallback(
    () => setMobileNavigationActive((mobileNavigationActive) => !mobileNavigationActive),
    [],
  );

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setSelectedProductId(null); 
    setMobileNavigationActive(false);
  };

  const handleBackToProducts = () => {
      setSelectedProductId(null);
  };

  // --- POLARIS MARKUP ---

  // 1. Top Bar (The header with user menu)
  const userMenuMarkup = (
    <TopBar.UserMenu
      actions={[
        {
          items: [{content: 'Disconnect Store', icon: ExitIcon, onAction: handleDisconnect}],
        },
      ]}
      name={shopName.replace('.myshopify.com', '')}
      initials={shopName.charAt(0).toUpperCase()}
    />
  );

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={userMenuMarkup}
      onNavigationToggle={toggleMobileNavigation}
    />
  );

  // 2. Navigation (The sidebar)
  const navigationMarkup = (
    <Navigation location="/">
      <Navigation.Section
        items={[
          {
            label: 'Products',
            icon: HomeIcon,
            selected: activeTab === 'products',
            onClick: () => handleNavClick('products'),
          },
          {
            label: 'Brand Kit',
            icon: PaintBrushFlatIcon,
            onClick: () => {
                setShowBrandKit(true);
                setMobileNavigationActive(false);
            },
          },
        ]}
      />
    </Navigation>
  );

  // --- RENDER ---
  
  if (!isInstalled) {
    return (
        <LandingPage 
            shopName={shopName} 
            setShopName={setShopName} 
            handleInstall={() => handleLoginSubmit(shopName)} 
        />
    );
  }

  return (
    <Frame
      topBar={topBarMarkup}
      navigation={navigationMarkup}
      showMobileNavigation={mobileNavigationActive}
      onNavigationDismiss={toggleMobileNavigation}
    >
      {showBrandKit && (
        <BrandKitModal 
          onClose={() => setShowBrandKit(false)} 
          shopName={shopName} 
        />
      )}

      {selectedProductId ? (
        <ProductDetail 
          productId={selectedProductId} 
          shopName={shopName} 
          onBack={handleBackToProducts} 
        />
      ) : (
        <ProductPage 
          onSelectProduct={(id) => setSelectedProductId(id)} 
          shopName={shopName} 
        />
      )}
    </Frame>
  );
};

export default App;
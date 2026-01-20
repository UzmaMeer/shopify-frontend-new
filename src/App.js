import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ProductPage from './components/ProductPage'; 
import ProductDetail from './components/ProductDetail'; 
import BrandKitModal from './components/BrandKitModal'; 
import './App.css'; 

const App = () => {
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

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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

  const handleLoginSubmit = (enteredShopName) => {
    if (!enteredShopName) return alert("Please enter store domain");
    let cleanShop = enteredShopName.trim();
    if (!cleanShop.includes(".myshopify.com")) {
      cleanShop += ".myshopify.com";
    }
    setShopName(cleanShop);
    setIsInstalled(true);
  };

  const handleDisconnect = () => {
    if (window.confirm("Are you sure you want to disconnect your store?")) {
        setIsInstalled(false);
        setShopName('');
        setSelectedProductId(null);
        setActiveTab('products');
        
        localStorage.removeItem('shopName');
        localStorage.removeItem('isInstalled');
        localStorage.removeItem('activeTab');
        localStorage.removeItem('selectedProductId');
    }
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setSelectedProductId(null); 
  };

  const handleBackToProducts = () => {
      setSelectedProductId(null);
  };

  return (
    <div className="store-full-page">
      
      {showBrandKit && (
        <BrandKitModal 
          onClose={() => setShowBrandKit(false)} 
          shopName={shopName} 
          // 🟢 REMOVED backendUrl prop (It imports it internally now)
        />
      )}

      {isInstalled && (
        <aside className={`sidebar-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <div className="brand-logo">
              <span>🎥</span>{!isSidebarCollapsed && <span>VideoAI</span>}
            </div>
            <button className="menu-toggle-btn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>☰</button>
          </div>
          
          <div className="nav-menu">
            <div className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => handleNavClick('products')}>
              <span className="nav-icon">📦</span>{!isSidebarCollapsed && <span>Products</span>}
            </div>

            <div className="nav-item" onClick={() => setShowBrandKit(true)}>
              <span className="nav-icon">🎨</span>{!isSidebarCollapsed && <span>Brand Kit</span>}
            </div>

            <div className="nav-item logout-item" onClick={handleDisconnect} style={{marginTop: 'auto', color: '#ff6b6b'}}>
               <span className="nav-icon">🚪</span>{!isSidebarCollapsed && <span>Disconnect</span>}
            </div>
          </div>

          <div className="sidebar-footer">
            <div className="status-card">
              <div className="status-dot"></div>
              {!isSidebarCollapsed && (
                <div>
                  <strong>Connected</strong><br/>
                  <small>{shopName.replace('.myshopify.com', '')}</small>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      <main className="main-content-scroll" style={{ padding: isInstalled ? '40px' : '0' }}>
        {!isInstalled ? (
          <LandingPage 
            shopName={shopName} 
            setShopName={setShopName} 
            handleInstall={() => handleLoginSubmit(shopName)} 
          />
        ) : (
          <>
            {selectedProductId ? (
              <ProductDetail 
                productId={selectedProductId} 
                shopName={shopName} 
                onBack={handleBackToProducts} 
                // 🟢 REMOVED backendUrl prop
              />
            ) : (
              <ProductPage 
                onSelectProduct={(id) => setSelectedProductId(id)} 
                shopName={shopName} 
                // 🟢 REMOVED backendUrl prop
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
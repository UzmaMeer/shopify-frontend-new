import React from 'react';
import './StoreGrid.css';

// Props mein 'onProductSelect' receive karein
const StoreGrid = ({ products, loading, onProductSelect }) => {
  
  if (loading) {
    return <div style={{textAlign:'center', marginTop:'50px'}}>Loading products...</div>;
  }

  return (
    <div>
      <div className="grid-header">
        <h2>Your Products</h2>
        <p>Select a product to generate a professional video ad.</p>
      </div>
      
      <div className="product-grid">
        {products.map(p => (
          <div key={p.id} className="product-card">
            <div className="image-container">
              <img 
                src={p.image?.src || p.images?.[0]?.src || 'https://via.placeholder.com/250'} 
                alt={p.title} 
              />
            </div>
            <div className="card-details">
              <h4 className="product-title">{p.title}</h4>
              
              {/* BUTTON CLICK PAR FUNCTION CALL */}
              <button 
                className="generate-btn"
                onClick={() => onProductSelect(p)} 
              >
                ✨ Create Video
              </button>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreGrid;
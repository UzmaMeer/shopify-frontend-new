import React, { useEffect, useState, useCallback } from 'react';
import './ProductDetail.css';
import { BACKEND_URL } from '../config'; 

const ProductPage = ({ onSelectProduct, shopName }) => { 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = useCallback(async (query = "") => {
    setLoading(true);
    // If shopName is missing, we cannot fetch data
    if (!shopName) return;

    try {
      // Construct the API URL
      let url = `${BACKEND_URL}/api/products?shop=${shopName}`;
      if (query) url += `&search=${encodeURIComponent(query)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true" 
        }
      });

      // 🚀 PROFESSIONAL AUTO-FIX LOGIC 🚀
      // Check if the Backend returned "401 Unauthorized" (Invalid Token).
      // This happens immediately after the merchant uninstalls and re-installs the app.
      if (response.status === 401) {
        console.warn("⚠️ Token is Invalid/Expired (401). Initiating Auto-Repair...");
        
        // Construct the Auth URL with the 'force_auth=true' flag.
        // This tells the backend: "Delete the old token and start a fresh login."
        const authUrl = `${BACKEND_URL}/api/auth?shop=${shopName}&force_auth=true`;
        
        // Critical Step: Break out of the Shopify Iframe.
        // We redirect the top window to the Auth URL.
        // This feels like a quick page refresh to the user.
        window.top.location.href = authUrl;
        
        return; // Stop execution here to prevent errors
      }

      const data = await response.json();

      // Fallback: If backend sends a 200 OK but with an error message
      if (data.error === "auth_needed") {
         console.warn("Manual auth requirement detected.");
         window.top.location.href = `${BACKEND_URL}/api/auth?shop=${shopName}&force_auth=true`;
         return;
      }

      setProducts(data.products || []);
      setError(null); // Clear previous errors if successful

    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Connection failed. Ensure Backend is running.");
    } finally {
      setLoading(false);
    }
  }, [shopName]); 

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(searchTerm);
  };

  if (error) return <div style={{padding:'20px', color:'red'}}>{error}</div>;

  return (
    <div className="products-container" style={{padding: '20px'}}>
      {/* --- Search Bar UI --- */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2>Your Products</h2>
        <form onSubmit={handleSearch} style={{display:'flex', gap:'10px'}}>
            <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{padding:'10px', borderRadius:'6px', border:'1px solid #ccc', width:'250px'}}
            />
            <button 
                type="submit"
                style={{padding:'10px 20px', background:'#008060', color:'white', border:'none', borderRadius:'6px', cursor:'pointer'}}
            >
                Search
            </button>
        </form>
      </div>

      {/* --- Products Grid --- */}
      {loading ? (
        <div style={{padding:'40px', textAlign:'center'}}><h3>⏳ Loading Products...</h3></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {products.length === 0 ? <p>No products found.</p> : products.map((product) => (
            <div 
                key={product.id} 
                onClick={() => onSelectProduct(product.id)}
                style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px', cursor: 'pointer', background: '#fff' }}
            >
                <div style={{width: '100%', height: '150px', backgroundColor: '#f4f4f4', borderRadius: '4px', overflow: 'hidden'}}>
                <img 
                    src={product.image ? product.image.src : (product.images && product.images[0] ? product.images[0].src : 'https://via.placeholder.com/150')} 
                    alt={product.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                </div>
                <h3 style={{ fontSize: '15px', margin: '10px 0', fontWeight: '600' }}>{product.title}</h3>
                <p style={{ color: '#555' }}>
                {product.variants && product.variants[0] ? `PKR ${product.variants[0].price}` : 'Price not set'}
                </p>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ProductPage;
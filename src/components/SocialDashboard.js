import React, { useState } from 'react';
import { Video, MoreHorizontal } from 'lucide-react';
const SocialDashboard = () => {
  // 1. State for managing Connected Accounts
  const [accounts, setAccounts] = useState({
    facebook: false,
    instagram: false
  });

  // 2. State for handling the new post form
  const [postContent, setPostContent] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all"); // 'all', 'facebook', or 'instagram'
  
  // 3. State for storing Published Posts (taake nazar aayein)
  const [publishedPosts, setPublishedPosts] = useState([
    { id: 1, platform: 'instagram', content: 'Sale is live now! #Shopify', date: '2025-12-30 10:00 AM', status: 'Published' }
  ]);

  // Mock function to simulate connecting an account
  const toggleConnection = (platform) => {
    // Real scenario mein yahan API call hogi (OAuth)
    setAccounts(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  // Function to handle "Post Now"
  const handlePost = (e) => {
    e.preventDefault();
    if (!postContent) return alert("Please write something to post!");
    
    if (selectedPlatform === 'all' && (!accounts.facebook || !accounts.instagram)) {
       // Just a check
    }

    // Nayi post create kar rahe hain
    const newPost = {
      id: Date.now(),
      platform: selectedPlatform === 'all' ? 'Facebook & Instagram' : selectedPlatform,
      content: postContent,
      date: new Date().toLocaleString(),
      status: 'Published' // Yeh show karega ke post ho gayi
    };

    // List mein add karein
    setPublishedPosts([newPost, ...publishedPosts]);
    setPostContent(""); // Input clear karein
    alert("Post published successfully!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Social Media Manager</h1>

      {/* SECTION 1: CONNECT ACCOUNTS */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Connect Your Accounts</h2>
        <div className="flex gap-4">
          
          {/* Facebook Button */}
          <button 
            onClick={() => toggleConnection('facebook')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all ${
              accounts.facebook 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Facebook size={20} />
            {accounts.facebook ? 'Facebook Connected' : 'Connect Facebook'}
            {accounts.facebook && <CheckCircle size={16} />}
          </button>

          {/* Instagram Button */}
          <button 
            onClick={() => toggleConnection('instagram')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all ${
              accounts.instagram 
              ? 'bg-pink-600 text-white border-pink-600' 
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Instagram size={20} />
            {accounts.instagram ? 'Instagram Connected' : 'Connect Instagram'}
            {accounts.instagram && <CheckCircle size={16} />}
          </button>
        </div>
      </div>

      {/* SECTION 2: CREATE POST */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Create New Post</h2>
        
        {(!accounts.facebook && !accounts.instagram) ? (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded">
            <AlertCircle size={20}/> Pehle upar se koi account connect karein.
          </div>
        ) : (
          <form onSubmit={handlePost}>
            
            {/* Platform Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Post to:</label>
              <select 
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Connected Platforms</option>
                {accounts.facebook && <option value="Facebook">Facebook Page</option>}
                {accounts.instagram && <option value="Instagram">Instagram Business</option>}
              </select>
            </div>

            {/* Text Area */}
            <div className="mb-4">
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-md h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Write your caption here..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              ></textarea>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium"
            >
              <Send size={18} /> Publish Now
            </button>
          </form>
        )}
      </div>

      {/* SECTION 3: RECENT POSTS (FEED) */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">3. Recent Activity (Live Feed)</h2>
        
        {publishedPosts.length === 0 ? (
          <p className="text-gray-500">No posts yet.</p>
        ) : (
          <div className="space-y-4">
            {publishedPosts.map((post) => (
              <div key={post.id} className="border border-gray-200 p-4 rounded-lg flex justify-between items-start hover:bg-gray-50 transition">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800 capitalize">
                      {post.platform.includes('Facebook') && <Facebook size={16} className="inline mr-1 text-blue-600"/>}
                      {post.platform.includes('Instagram') && <Instagram size={16} className="inline mr-1 text-pink-600"/>}
                      {post.platform}
                    </span>
                    <span className="text-xs text-gray-500">• {post.date}</span>
                  </div>
                  <p className="text-gray-700">{post.content}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default SocialDashboard;
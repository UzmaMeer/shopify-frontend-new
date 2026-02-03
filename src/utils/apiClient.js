import { BACKEND_URL } from '../config';

/**
 * Professional wrapper for the Fetch API.
 * This function automatically handles authentication errors (401).
 * If a token is expired (e.g., after re-installation), it redirects the user to fix it.
 */
export const authenticatedFetch = async (endpoint, shopName, options = {}) => {
    // 1. Construct the full Backend URL
    let url = `${BACKEND_URL}${endpoint}`;
    
    // Ensure the 'shop' parameter is always attached for context
    if (url.includes('?')) {
        url += `&shop=${shopName}`;
    } else {
        url += `?shop=${shopName}`;
    }

    try {
        // 2. Perform the API Request
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                // Essential for testing with Ngrok free tier
                "ngrok-skip-browser-warning": "true", 
                ...options.headers
            }
        });

        // 3. 🚀 AUTO-HEALING LOGIC (The Professional Fix)
        // If the Backend returns "401 Unauthorized", it means the token is dead.
        // This happens immediately after an uninstall/re-install cycle.
        if (response.status === 401) {
            console.warn("🔄 Session Expired. Initiating auto-repair sequence...");
            
            // Construct the Auth URL with the 'force_auth=true' flag.
            // This flag tells the backend to delete the old token and start fresh.
            const authUrl = `${BACKEND_URL}/api/auth?shop=${shopName}&force_auth=true`;
            
            // Break out of the Shopify Iframe and redirect the main window to Auth.
            // This happens so fast the user usually just sees a quick page reload.
            window.top.location.href = authUrl;
            
            // Return null to stop the current function from crashing
            return null; 
        }

        // If status is 200 (OK), return the response normally
        return response;

    } catch (error) {
        console.error("Network or CORS Error:", error);
        throw error;
    }
};
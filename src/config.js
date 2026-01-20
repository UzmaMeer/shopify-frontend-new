// src/config.js

// 1. Define your Backend URLs
const PROD_URL = "https://shopify-ext.20thletter.com";
const DEV_URL = "https://snakiest-edward-autochthonously.ngrok-free.dev";

// 2. Intelligence Logic: Check the browser's current address
// If the hostname includes "20thletter.com", we are in Production.
const isProduction = window.location.hostname.includes("20thletter.com");

// 3. Export the correct URL based on the check
export const BACKEND_URL = isProduction ? PROD_URL : DEV_URL;

// Optional: Log it so you can verify in browser console
console.log(`🔌 App Environment: ${isProduction ? "PRODUCTION" : "DEVELOPMENT"}`);
console.log(`🔗 Backend Connected: ${BACKEND_URL}`);
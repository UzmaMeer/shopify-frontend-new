// 🟢 CONFIGURATION SETTINGS
// Change this to 'false' ONLY when you are ready to use AWS again.
const FORCE_NGROK = true; 

// 1. Your Backend URLs
const AWS_URL = "http://16.170.226.79:8000";
const NGROK_URL = "https://snakiest-edward-autochthonously.ngrok-free.dev";

// 2. Logic to pick the correct backend
const isLocalhost = window.location.hostname === "localhost";

let selectedBackend;

if (FORCE_NGROK) {
    // 🛡️ Safety Mode: If we are debugging or AWS is down, ALWAYS use Ngrok.
    console.log("⚠️ FORCE_NGROK is ON: Using Tunnel");
    selectedBackend = NGROK_URL;
    
} else if (isLocalhost) {
    // 🏠 Localhost Mode: Local frontend always talks to Ngrok (to avoid mixed content)
    console.log("🏠 Localhost detected: Using Ngrok");
    selectedBackend = NGROK_URL;

} else {
    console.log("☁️ Live Site detected: Using AWS");
    selectedBackend = AWS_URL;
}

// 3. Export it
export const BACKEND_URL = selectedBackend;

// 4. Debug print so you can see it in Chrome Console (F12)
console.log(`🔗 FINAL CONNECTION URL: ${BACKEND_URL}`);
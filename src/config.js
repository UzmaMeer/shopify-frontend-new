
const FORCE_USE_NGROK = true; 

// 🟢 1. AWS Production URL (Keep this safe for later)
const AWS_URL = "http://16.170.226.79:8000";

// 🟠 2. Ngrok URL (Your Laptop)
// I copied this exactly from your screenshot 👇
const NGROK_URL = "https://snakiest-edward-autochthonously.ngrok-free.dev"; 

// 3. Logic: Decide which one to use
const isLocalhost = window.location.hostname === "localhost";

let selectedBackend;

if (isLocalhost) {
    selectedBackend = NGROK_URL; // Localhost always uses Ngrok
} else {
    // We are on the Live Website (Firebase)
    if (FORCE_USE_NGROK) {
        selectedBackend = NGROK_URL; // FORCED: Live site talks to Laptop
    } else {
        selectedBackend = AWS_URL;   // STANDARD: Live site talks to AWS
    }
}

export const BACKEND_URL = selectedBackend;

console.log(`🔌 Mode: ${FORCE_USE_NGROK ? "DEBUG (Ngrok)" : "LIVE (AWS)"}`);
console.log(`🔗 Connecting to: ${BACKEND_URL}`);
// ===========================================
// API Configuration
// ===========================================
// Toggle this to switch between local development and production

const IS_PRODUCTION = false; // ← Change to `true` when deploying

// Local development URLs
const LOCAL_BACKEND_URL = "http://127.0.0.1:5000";
const LOCAL_AI_SERVICE_URL = "http://127.0.0.1:5001";

// Production URLs (update these after deploying to Render)
const PROD_BACKEND_URL = "https://your-backend.onrender.com";      // ← Replace with your Render URL
const PROD_AI_SERVICE_URL = "https://your-ai-service.onrender.com"; // ← Replace with your AI service URL (if deploying)

// Export the active URLs
export const API_BASE = IS_PRODUCTION ? PROD_BACKEND_URL : LOCAL_BACKEND_URL;
export const AI_SERVICE_URL = IS_PRODUCTION ? PROD_AI_SERVICE_URL : LOCAL_AI_SERVICE_URL;

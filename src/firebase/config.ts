/**
 * Firebase Configuration (v1.3.5)
 * Prioritizes environment variables from Render/Cloudflare.
 */
export const firebaseConfig = {
  // IMPORTANT: Since you deleted your old key, you must paste the NEW key from Google Cloud 
  // into your Render Environment Variables as NEXT_PUBLIC_FIREBASE_API_KEY
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "REPLACE_WITH_NEW_KEY_IF_NOT_IN_ENV",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "rent-a-host-a55fd.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rent-a-host-a55fd",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "rent-a-host-a55fd.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "675996746308",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:675996746308:web:8a22f37db14f2f700b3211",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-8YBHMBD5QG"
};

// Diagnostic logging for deployment verification
if (typeof window !== 'undefined') {
    console.log("--- FIREBASE DIAGNOSTICS v1.3.5 ---");
    console.log("API Key Status:", firebaseConfig.apiKey.includes("REPLACE") ? "MISSING/DEFAULT" : "ACTIVE (" + firebaseConfig.apiKey.slice(-4) + ")");
    console.log("Current Hostname:", window.location.hostname);
    console.log("-----------------------------------");
}

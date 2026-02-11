
/**
 * Firebase Configuration (v1.4.1)
 * Optimized for Firebase Hosting deployment.
 * 
 * IMPORTANT: Ensure the apiKey is updated with your new GCP key.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "REPLACE_WITH_NEW_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "rent-a-host-a55fd.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rent-a-host-a55fd",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "rent-a-host-a55fd.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "675996746308",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:675996746308:web:8a22f37db14f2f700b3211",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-8YBHMBD5QG"
};

// Advanced Diagnostics
if (typeof window !== 'undefined') {
    const keyStatus = firebaseConfig.apiKey.includes("REPLACE") ? "⚠️ MISSING (REPLACE_WITH_NEW_KEY)" : "✅ ACTIVE";
    const last4 = !firebaseConfig.apiKey.includes("REPLACE") ? firebaseConfig.apiKey.slice(-4) : "N/A";
    
    console.log("%c--- FIREBASE HOSTING DIAGNOSTICS v1.4.1 ---", "color: #f59e0b; font-weight: bold; font-size: 12px;");
    console.log(`Project: ${firebaseConfig.projectId}`);
    console.log(`API Key: ${keyStatus} (Ends in: ${last4})`);
    console.log(`Current Hostname: ${window.location.hostname}`);
    console.log("%c------------------------------------------", "color: #f59e0b; font-weight: bold;");
}

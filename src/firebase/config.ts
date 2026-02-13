
/**
 * Firebase Configuration (v1.4.3)
 * Optimized for the new project: hostproai-cc2e3
 * 
 * IMPORTANT: You must replace the placeholders with your actual keys 
 * from the Firebase Console (Project Settings).
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "REPLACE_WITH_NEW_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "hostproai-cc2e3.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "hostproai-cc2e3",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "hostproai-cc2e3.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "REPLACE_WITH_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "REPLACE_WITH_APP_ID",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "REPLACE_WITH_MEASUREMENT_ID"
};

// Advanced Diagnostics
if (typeof window !== 'undefined') {
    const keyStatus = firebaseConfig.apiKey.includes("REPLACE") ? "⚠️ MISSING (REPLACE_WITH_NEW_KEY)" : "✅ ACTIVE";
    const last4 = !firebaseConfig.apiKey.includes("REPLACE") ? firebaseConfig.apiKey.slice(-4) : "N/A";
    
    console.log("%c--- FIREBASE PROJECT SYNC v1.4.3 ---", "color: #f59e0b; font-weight: bold; font-size: 12px;");
    console.log(`Project: ${firebaseConfig.projectId}`);
    console.log(`API Key: ${keyStatus} (Ends in: ${last4})`);
    console.log(`Region: us-east4`);
    console.log("%c------------------------------------------", "color: #f59e0b; font-weight: bold;");
}

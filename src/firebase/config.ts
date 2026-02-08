/**
 * Firebase Configuration (v1.2.3)
 * Prioritizes environment variables for production environments like Render and Cloudflare.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCVM8NoXlgZXbvYohxzLJaje4gU7sK4qdA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "rent-a-host-a55fd.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rent-a-host-a55fd",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "rent-a-host-a55fd.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "675996746308",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:675996746308:web:8a22f37db14f2f700b3211",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-8YBHMBD5QG"
};

// Diagnostic logging for deployment verification
if (typeof window !== 'undefined') {
    console.log("Firebase initialized with API Key (last 4):", firebaseConfig.apiKey.slice(-4));
}

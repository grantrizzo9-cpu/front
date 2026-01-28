'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';

// --- Singleton Pattern for Firebase Services ---
// This ensures that Firebase is initialized only once, even with Next.js Fast Refresh.

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

if (!getApps().length) {
  // First time initialization
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  // Initialize Firestore with no special options
  firestore = initializeFirestore(app, {}); 
  
  // Enable persistence, catching potential errors (e.g., multiple tabs open)
  enableIndexedDbPersistence(firestore)
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        console.warn('Firestore persistence failed: multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code == 'unimplemented') {
        console.warn('Firestore persistence is not available in this browser.');
      }
    });
} else {
  // On subsequent reloads (HMR), get the existing instances
  app = getApp();
  auth = getAuth(app);
  firestore = getFirestore(app); // This safely gets the already-initialized instance
}

/**
 * Returns the initialized Firebase services.
 */
export function initializeFirebase() {
  return {
    firebaseApp: app,
    auth,
    firestore,
  };
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, getFirestore, Firestore } from 'firebase/firestore';

function getServices() {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    let firestore: Firestore;

    // This check is crucial for Next.js Fast Refresh (HMR).
    // It caches the Firestore instance on the window object to prevent re-initialization.
    if (typeof window !== 'undefined') {
        if (!(window as any)._firestoreInstance) {
            (window as any)._firestoreInstance = initializeFirestore(app, {
                localCache: persistentLocalCache()
            });
        }
        firestore = (window as any)._firestoreInstance;
    } else {
        // Fallback for non-browser environments (less likely with 'use client' but safe).
        firestore = getFirestore(app);
    }
    
    return { app, auth, firestore };
}

const { app, auth, firestore } = getServices();

/**
 * Returns the initialized Firebase services.
 * This function now safely returns the cached instances, preventing HMR-related crashes.
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

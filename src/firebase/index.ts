'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, getFirestore, Firestore } from 'firebase/firestore';

// This is a more robust pattern to handle HMR
// We declare the services at the module level
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// Get the existing app instance or initialize a new one.
app = getApps().length ? getApp() : initializeApp(firebaseConfig);
auth = getAuth(app);

// Now, handle Firestore initialization carefully.
// This is the tricky part with HMR.
try {
    // Try to initialize with persistence.
    firestore = initializeFirestore(app, {
        localCache: persistentLocalCache({})
    });
} catch (e: any) {
    // This will fail if Firestore is already initialized,
    // which happens during HMR. In that case, we just get the existing instance.
    if (e.code === 'failed-precondition') {
        // This specific error can happen with multiple tabs open.
        // It's safe to just get the existing instance.
        firestore = getFirestore(app);
    } else if (e.code !== 'already-exists') {
        // We want to know about other errors.
        throw e;
    } else {
        // This is the 'already-exists' error from HMR, which is expected.
        // We can safely get the existing instance.
        firestore = getFirestore(app);
    }
}


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

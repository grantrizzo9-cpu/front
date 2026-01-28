'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, getFirestore, Firestore } from 'firebase/firestore';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Forcing initialization from the config file to bypass potentially stale env vars
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  let firestore: Firestore;
  try {
    // Initialize Firestore with offline persistence enabled.
    firestore = initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache(),
    });
  } catch (e: any) {
    // If initializeFirestore fails (e.g., already initialized in a different
    // context like HMR), fall back to getFirestore to retrieve the instance.
    // This is the recommended approach to avoid initialization errors in Next.js.
    firestore = getFirestore(firebaseApp);
  }
  
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: firestore
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

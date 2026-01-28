'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, getFirestore, Firestore } from 'firebase/firestore';

/**
 * Initializes and returns the Firebase services.
 * This function is structured to handle Next.js's Fast Refresh feature in development,
 * preventing the "already initialized" error by checking if services already exist.
 */
export function initializeFirebase() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  
  let firestore: Firestore;
  try {
    // Attempt to initialize Firestore with offline persistence.
    // This may throw an error during hot-reloads in development if it's already initialized.
    firestore = initializeFirestore(app, {
      localCache: persistentLocalCache(),
    });
  } catch (e: any) {
    // In case of an error (like during a hot-reload), we fall back to getting the
    // already-initialized instance. This prevents the app from crashing.
    firestore = getFirestore(app);
  }
  
  const auth = getAuth(app);

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

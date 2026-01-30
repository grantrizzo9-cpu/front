'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

export interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// Defer initialization until this function is called.
export function initializeFirebase(): FirebaseServices {
  const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth: Auth = getAuth(app);
  const firestore: Firestore = getFirestore(app);
  
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

'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import type { FirebaseServices } from '@/firebase';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // useMemo ensures this expensive initialization only runs once per component lifecycle.
  const firebaseServices = useMemo<FirebaseServices | null>(() => {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      
      if (app.options.apiKey?.includes('REPLACE_WITH')) {
        throw new Error("Your Firebase configuration contains placeholder values. Please add your project's configuration to `src/firebase/config.ts`.");
      }

      const auth = getAuth(app);
      const firestore = getFirestore(app);

      // Enable persistence for better resilience against "offline" errors
      if (typeof window !== 'undefined') {
        enableMultiTabIndexedDbPersistence(firestore).catch((err) => {
          if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time.
            console.warn("Firestore persistence could not be enabled: Multiple tabs open.");
          } else if (err.code === 'unimplemented') {
            // The current browser does not support all of the features required to enable persistence
            console.warn("Firestore persistence is not supported by this browser.");
          }
        });
      }

      return { firebaseApp: app, auth, firestore };
    } catch (e: any) {
      console.error("Firebase Initialization Error:", e);
      return null;
    }
  }, []);

  if (!firebaseServices) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-4 bg-background">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Application Configuration Error</AlertTitle>
          <AlertDescription>
            Failed to initialize Firebase. This is often caused by an invalid configuration or project suspension. Please verify your project details in the Firebase console.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}

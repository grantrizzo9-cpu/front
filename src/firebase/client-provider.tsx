'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import type { FirebaseServices } from '@/firebase';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // useMemo ensures this expensive initialization only runs once per component lifecycle.
  // It's the key to defeating the HMR race condition.
  const firebaseServices = useMemo<FirebaseServices | null>(() => {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      
      if (app.options.apiKey?.includes('REPLACE_WITH')) {
        throw new Error("Your Firebase configuration contains placeholder values. Please add your project's configuration to `src/firebase/config.ts`.");
      }

      const auth = getAuth(app);
      
      // By calling initializeFirestore here, before any other part of the app can call getFirestore(),
      // we ensure that persistence is enabled correctly from the very start.
      // The modern SDK handles being called multiple times on the same app instance gracefully.
      const firestore = initializeFirestore(app, {
        localCache: persistentLocalCache({}),
      });

      return { firebaseApp: app, auth, firestore };
    } catch (e: any) {
      console.error("Firebase Initialization Error:", e);
      // We are returning null on error and will handle it below.
      return null;
    }
  }, []); // Empty dependency array means this runs only on the first render.

  if (!firebaseServices) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-4 bg-background">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Application Configuration Error</AlertTitle>
          <AlertDescription>
            Failed to initialize Firebase. This is often caused by an invalid or incomplete configuration in `src/firebase/config.ts`. Please verify your Firebase project details.
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

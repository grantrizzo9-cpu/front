
'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, WifiOff } from 'lucide-react';
import type { FirebaseServices } from '@/firebase';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseServices = useMemo<FirebaseServices | null>(() => {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      
      if (app.options.apiKey?.includes('REPLACE_WITH')) {
        throw new Error("Missing Firebase configuration.");
      }

      const auth = getAuth(app);
      const firestore = getFirestore(app);

      // Enable offline persistence to handle flaky connections or restricted project states
      if (typeof window !== 'undefined') {
        enableMultiTabIndexedDbPersistence(firestore).catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn("Firestore persistence: Multiple tabs open.");
          } else if (err.code === 'unimplemented') {
            console.warn("Firestore persistence: Browser not supported.");
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
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            The application is unable to reach the backend services. This typically happens if your project account is suspended or the client is offline. Please check your Firebase console or internet connection.
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

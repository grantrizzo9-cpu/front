'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, WifiOff, CloudOff } from 'lucide-react';
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

      // Enable offline persistence to handle connection gaps
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
        <div className="max-w-lg w-full space-y-6 text-center">
            <CloudOff className="h-16 w-16 mx-auto text-destructive opacity-50" />
            <Alert variant="destructive">
                <AlertTitle className="text-lg font-bold">Backend Connection Failed</AlertTitle>
                <AlertDescription className="mt-2 text-sm">
                    The application is unable to connect to the Firebase backend. 
                    <br/><br/>
                    <strong>Common causes:</strong>
                    <ul className="list-disc list-inside text-left mt-2 space-y-1">
                        <li>The Firebase project is suspended (Billing issues).</li>
                        <li>API Keys are invalid or restricted.</li>
                        <li>Your internet connection is blocking Firebase domains.</li>
                    </ul>
                    <br/>
                    Please check the Firebase console for project status notifications.
                </AlertDescription>
            </Alert>
        </div>
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
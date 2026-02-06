'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CloudOff, ShieldAlert } from 'lucide-react';
import type { FirebaseServices } from '@/firebase';

/**
 * FirebaseClientProvider
 * Performance Version: 1.0.9 (Railway Optimized)
 * This version forces Long Polling to bypass WebSocket blocks common on Railway.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseServices = useMemo<FirebaseServices | null>(() => {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      
      if (app.options.apiKey?.includes('REPLACE_WITH')) {
        throw new Error("Missing Firebase configuration.");
      }

      const auth = getAuth(app);
      
      // Force Long Polling immediately to fix "Client Offline" errors on Railway
      const firestore = initializeFirestore(app, {
          experimentalForceLongPolling: true,
          ignoreUndefinedProperties: true,
      });

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
                <AlertTitle className="text-lg font-bold flex items-center justify-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    Backend Connection Failed
                </AlertTitle>
                <AlertDescription className="mt-2 text-sm text-left">
                    The application is unable to connect to the Firebase backend. 
                    <br/><br/>
                    <strong>Required Action:</strong>
                    <p className="mt-2">Ensure your domain <strong>hostproai.com</strong> is whitelisted in your Google Cloud Console API Credentials (README Step 2).</p>
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

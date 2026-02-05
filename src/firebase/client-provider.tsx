
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
 * Connectivity Version: 1.0.4 (Enhanced Long Polling for AWS Amplify)
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseServices = useMemo<FirebaseServices | null>(() => {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      
      if (app.options.apiKey?.includes('REPLACE_WITH')) {
        throw new Error("Missing Firebase configuration.");
      }

      const auth = getAuth(app);
      
      // PLAN C+: Force Long Polling + Auto-detection.
      // This is the most stable configuration for sites behind AWS WAF or Amplify Proxies.
      const firestore = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        useFetchStreams: false, // More compatible with standard firewalls
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
                <AlertDescription className="mt-2 text-sm">
                    The application is unable to connect to the Firebase backend. 
                    <br/><br/>
                    <strong>Most Likely Fix:</strong>
                    <p className="mt-2">Your domain <strong>hostproai.com</strong> needs to be whitelisted in your Google Cloud Console.</p>
                    <ul className="list-disc list-inside text-left mt-2 space-y-1">
                        <li>Log into Google Cloud Console.</li>
                        <li>Edit your "Browser Key".</li>
                        <li>Add <code>https://hostproai.com/*</code> to the website restrictions.</li>
                    </ul>
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

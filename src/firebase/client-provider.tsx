
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

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseServices = useMemo<FirebaseServices | null>(() => {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      
      if (app.options.apiKey?.includes('REPLACE_WITH')) {
        throw new Error("Missing Firebase configuration.");
      }

      const auth = getAuth(app);
      
      // We use initializeFirestore instead of getFirestore to force Long Polling.
      // This is a "Plan C" workaround for when domain whitelisting in Google Cloud isn't possible yet.
      // It helps the client stay "Online" on custom domains by using standard HTTP instead of WebSockets.
      const firestore = initializeFirestore(app, {
        experimentalForceLongPolling: true,
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
                    The application is unable to connect to the Firebase backend (Project: <strong>{firebaseConfig.projectId}</strong>). 
                    <br/><br/>
                    <strong>Common causes:</strong>
                    <ul className="list-disc list-inside text-left mt-2 space-y-1">
                        <li>The Firebase project is suspended (Check billing in Google Cloud Console).</li>
                        <li>API Keys are restricted to specific domains (Ensure <strong>hostproai.com</strong> is allowed).</li>
                        <li>The project reached its free-tier usage limit.</li>
                    </ul>
                    <br/>
                    Please check the <strong>Firebase Console</strong> or <strong>Google Cloud Console</strong> for alerts.
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

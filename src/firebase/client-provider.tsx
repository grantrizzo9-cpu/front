'use client';

import React, { useMemo, type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CloudOff, ShieldAlert, Loader2 } from 'lucide-react';
import type { FirebaseServices } from '@/firebase';

/**
 * FirebaseClientProvider
 * Performance Version: 1.1.8 (Hydration Safe)
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const firebaseServices = useMemo<FirebaseServices | null>(() => {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      
      if (app.options.apiKey?.includes('REPLACE_WITH')) {
        return null;
      }

      const auth = getAuth(app);
      
      const firestore = initializeFirestore(app, {
          ignoreUndefinedProperties: true,
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
      });

      return { firebaseApp: app, auth, firestore };
    } catch (e: any) {
      console.error("Firebase Initialization Error:", e);
      return null;
    }
  }, []);

  // Avoid hydration mismatch by rendering a simple loader until client-side mount
  if (!isHydrated) {
    return <div className="flex h-screen w-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;
  }

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

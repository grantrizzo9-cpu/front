
'use client';

import React, { useMemo, type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  Firestore
} from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CloudOff, ShieldAlert, Loader2 } from 'lucide-react';
import type { FirebaseServices } from '@/firebase';

/**
 * Robust Singleton Pattern for Firebase Services
 */
let cachedApp: FirebaseApp | undefined;
let cachedAuth: Auth | undefined;
let cachedFirestore: Firestore | undefined;

function getFirebase(): FirebaseServices | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Get or Initialize App
    const apps = getApps();
    if (apps.length > 0) {
      cachedApp = getApp();
    } else {
      cachedApp = initializeApp(firebaseConfig);
    }
    
    if (cachedApp.options.apiKey?.includes('REPLACE_WITH')) {
      return null;
    }

    // 2. Get or Initialize Auth
    if (!cachedAuth) {
      cachedAuth = getAuth(cachedApp);
    }
    
    // 3. Get or Initialize Firestore with safety check
    if (!cachedFirestore) {
      try {
        // Try to initialize with our specific performance settings
        cachedFirestore = initializeFirestore(cachedApp, {
            ignoreUndefinedProperties: true,
            localCache: persistentLocalCache({
              tabManager: persistentMultipleTabManager(),
            }),
        });
      } catch (e: any) {
        // If it was already initialized elsewhere (e.g. by a background process), just get the existing instance
        cachedFirestore = getFirestore(cachedApp);
      }
    }

    return { 
      firebaseApp: cachedApp, 
      auth: cachedAuth!, 
      firestore: cachedFirestore! 
    };
  } catch (e) {
    console.error("Firebase critical init error:", e);
    return null;
  }
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Ensure services are only requested once
  const firebaseServices = useMemo(() => getFirebase(), []);

  // HYDRATION GUARD: Render a clean shell first
  if (!isHydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  // If configuration is missing or domain is blocked
  if (!firebaseServices) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-4 bg-background">
        <div className="max-w-lg w-full space-y-6 text-center">
            <CloudOff className="h-16 w-16 mx-auto text-destructive opacity-50" />
            <Alert variant="destructive">
                <AlertTitle className="text-lg font-bold flex items-center justify-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    Secure Connection Required
                </AlertTitle>
                <AlertDescription className="mt-2 text-sm text-left">
                    Your domain <strong>hostproai.com</strong> is correctly set up in Cloudflare, but it must be authorized in your Firebase security settings to access the database.
                    <br/><br/>
                    <strong>The Final Step:</strong>
                    <p className="mt-2">Go to <strong>Firebase Console > Auth > Settings > Authorized Domains</strong> and add <code>hostproai.com</code>.</p>
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

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
 * Singleton Pattern for Firebase Services
 */
let cachedApp: FirebaseApp | undefined;
let cachedAuth: Auth | undefined;
let cachedFirestore: Firestore | undefined;

function getFirebase(): FirebaseServices | null {
  if (typeof window === 'undefined') return null;

  try {
    const apps = getApps();
    if (apps.length > 0) {
      cachedApp = getApp();
    } else {
      cachedApp = initializeApp(firebaseConfig);
    }
    
    if (cachedApp.options.apiKey?.includes('REPLACE_WITH')) {
      return null;
    }

    if (!cachedAuth) {
      cachedAuth = getAuth(cachedApp);
    }
    
    if (!cachedFirestore) {
      try {
        cachedFirestore = initializeFirestore(cachedApp, {
            ignoreUndefinedProperties: true,
            localCache: persistentLocalCache({
              tabManager: persistentMultipleTabManager(),
            }),
        });
      } catch (e: any) {
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
  const [currentHostname, setCurrentHostname] = useState<string>('');

  useEffect(() => {
    setIsHydrated(true);
    setCurrentHostname(window.location.hostname);
  }, []);

  // Use useMemo to get services only after hydration to prevent mismatch
  const firebaseServices = useMemo(() => {
    if (!isHydrated) return null;
    return getFirebase();
  }, [isHydrated]);

  // Pass 1: Server-side and Initial Client Render (Identical)
  if (!isHydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  // Pass 2: Client-side after hydration
  if (!firebaseServices) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-4 bg-background">
        <div className="max-w-lg w-full space-y-6 text-center">
            <CloudOff className="h-16 w-16 mx-auto text-destructive opacity-50" />
            <Alert variant="destructive">
                <AlertTitle className="text-lg font-bold flex items-center justify-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    Connection Blocked
                </AlertTitle>
                <AlertDescription className="mt-2 text-sm text-left">
                    The domain <strong>{currentHostname}</strong> must be authorized in your Firebase security settings.
                    <br/><br/>
                    <strong>Required Step:</strong>
                    <p className="mt-2">Go to <strong>Firebase Console > Auth > Settings > Authorized Domains</strong> and add <code>{currentHostname}</code>.</p>
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

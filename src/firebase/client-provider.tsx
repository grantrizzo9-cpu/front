'use client';

import React, { type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { 
  initializeFirestore, 
  Firestore,
  terminate,
  clearIndexedDbPersistence
} from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CloudOff, ShieldAlert, Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FirebaseServices } from '@/firebase';

let cachedApp: FirebaseApp | undefined;
let cachedAuth: Auth | undefined;
let cachedFirestore: Firestore | undefined;

async function getFirebase(): Promise<FirebaseServices | null> {
  if (typeof window === 'undefined') return null;

  try {
    const apps = getApps();
    if (apps.length > 0) {
      cachedApp = getApp();
    } else {
      cachedApp = initializeApp(firebaseConfig);
    }
    
    if (!cachedAuth) {
      cachedAuth = getAuth(cachedApp);
    }
    
    if (!cachedFirestore) {
      // FORCE Long Polling: This is essential for Render environments to bypass WebSocket blocks
      cachedFirestore = initializeFirestore(cachedApp, {
          ignoreUndefinedProperties: true,
          experimentalForceLongPolling: true, 
      });

      // Aggressively clear persistence on every cold start to avoid "Offline" loops
      try {
          await terminate(cachedFirestore);
          await clearIndexedDbPersistence(cachedFirestore);
          // Re-initialize after clear
          cachedFirestore = initializeFirestore(cachedApp, {
              ignoreUndefinedProperties: true,
              experimentalForceLongPolling: true, 
          });
      } catch (e) {
          // Persistence might be locked if open in another tab, continue anyway
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
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
    getFirebase().then(services => {
        setFirebaseServices(services);
        setIsInitializing(false);
    });
  }, []);

  const handleHardReset = async () => {
      if (firebaseServices?.firestore) {
          try {
              await terminate(firebaseServices.firestore);
              await clearIndexedDbPersistence(firebaseServices.firestore);
          } catch (e) {
              console.error("Reset error:", e);
          }
          window.location.reload();
      } else {
          window.location.reload();
      }
  };

  if (!isHydrated || isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  if (!firebaseServices) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-4 bg-background">
        <div className="max-w-lg w-full space-y-6 text-center">
            <CloudOff className="h-16 w-16 mx-auto text-destructive opacity-50" />
            <Alert variant="destructive">
                <AlertTitle className="text-lg font-bold flex items-center justify-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    Configuration Sync Error
                </AlertTitle>
                <AlertDescription className="mt-2 text-sm text-left space-y-4">
                    <p>The app could not connect to Firebase. This usually means Render environment variables are still propagating or the API key is invalid.</p>
                    <Button onClick={handleHardReset} variant="outline" className="w-full bg-white text-black font-bold shadow-sm">
                        <RefreshCcw className="mr-2 h-4 w-4" /> Hard Reset App
                    </Button>
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

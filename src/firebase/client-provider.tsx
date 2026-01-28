
'use client';

import React, { useMemo, type ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { enableIndexedDbPersistence, doc, onSnapshot } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => initializeFirebase(), []);
  
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Step 1: Enable persistence. This is fast and prepares offline storage.
        await enableIndexedDbPersistence(firebaseServices.firestore);
      } catch (err: any) {
        if (err.code == 'failed-precondition') {
          console.warn('Firestore persistence failed because multiple tabs are open. App will work but without multi-tab offline sync.');
        } else if (err.code == 'unimplemented') {
          console.error('Firestore persistence is not supported in this browser.');
          setError('Offline features are not supported in this browser.');
          return; // Stop initialization if persistence is not supported
        } else {
          console.error('An unexpected error occurred while enabling Firestore persistence:', err);
          setError('Could not enable offline features.');
          return;
        }
      }

      // Step 2: Set the app as ready, bypassing the strict connection check for now.
      setIsReady(true);
    };

    initialize();
  }, [firebaseServices.firestore]);

  if (error) {
     return (
      <div className="flex h-screen w-screen items-center justify-center p-4">
        <div className="text-center text-destructive">
            <h1 className="text-xl font-bold">Application Error</h1>
            <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (!isReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Initializing Application...</p>
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

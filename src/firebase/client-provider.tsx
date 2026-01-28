
'use client';

import React, { useMemo, type ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { enableIndexedDbPersistence } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Get the base services. useMemo ensures this only runs once.
  const firebaseServices = useMemo(() => initializeFirebase(), []);
  
  const [persistenceEnabled, setPersistenceEnabled] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs once on the client after the initial render.
    const enablePersistence = async () => {
      try {
        await enableIndexedDbPersistence(firebaseServices.firestore);
        setPersistenceEnabled(true);
      } catch (err: any) {
        if (err.code == 'failed-precondition') {
          // This is a common, non-critical error when multiple tabs are open.
          // The app will still work, just without multi-tab offline sync.
          // We can consider persistence enabled in this case for the UI.
          console.warn('Firestore persistence failed because multiple tabs are open.');
          setPersistenceEnabled(true);
        } else if (err.code == 'unimplemented') {
          // The browser doesn't support persistence.
          console.error('Firestore persistence is not supported in this browser.');
          setPersistenceError('Offline features are not supported in this browser.');
        } else {
          console.error('An unexpected error occurred while enabling Firestore persistence:', err);
          setPersistenceError('Could not enable offline features.');
        }
      }
    };

    enablePersistence();

  }, [firebaseServices.firestore]);

  // We can show a loading screen until persistence is set up.
  // This prevents the user from interacting with the app before it's ready.
  if (!persistenceEnabled && !persistenceError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Initializing Application...</p>
        </div>
      </div>
    );
  }
  
  if (persistenceError) {
     return (
      <div className="flex h-screen w-screen items-center justify-center p-4">
        <div className="text-center text-destructive">
            <h1 className="text-xl font-bold">Application Error</h1>
            <p>{persistenceError}</p>
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


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
        await enableIndexedDbPersistence(firebaseServices.firestore);
      } catch (err: any) {
        if (err.code === 'failed-precondition') {
          console.warn('Firestore persistence failed because multiple tabs are open. App will work but without multi-tab offline sync.');
        } else if (err.code === 'unimplemented') {
          setError('Offline features are not supported in this browser.');
          return;
        }
      }

      // Perform a quick, non-blocking check to see if we can talk to the backend.
      // This helps catch config errors early without blocking the UI for too long.
      const testDoc = doc(firebaseServices.firestore, '_config/check');
      const unsubscribe = onSnapshot(testDoc, 
        () => {
          // Success! We can connect.
          setIsReady(true);
          unsubscribe();
        },
        (err) => {
           if (err.code === 'permission-denied') {
             setError("Could not connect to the database. This is likely due to an invalid Firebase configuration. Please update `src/firebase/config.ts` with the correct values from your Firebase project.");
           } else {
             setError(`Could not connect to the database: ${err.message}. Please check your network connection and Firebase setup.`);
           }
          unsubscribe();
        }
      );
    };

    if (firebaseServices.firestore.app.options.apiKey?.includes('REPLACE_WITH')) {
        setError("Your Firebase configuration in `src/firebase/config.ts` is incomplete. Please add the correct values from your project.");
    } else {
        initialize();
    }
  }, [firebaseServices.firestore]);

  if (error) {
     return (
      <div className="flex h-screen w-screen items-center justify-center p-4 bg-background">
        <div className="text-center text-destructive border border-destructive/50 rounded-lg p-6 max-w-lg">
            <h1 className="text-xl font-bold">Application Error</h1>
            <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!isReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Connecting to Database...</p>
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

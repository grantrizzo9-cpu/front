
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
      // The previous check against a Firestore document was unreliable due to security rules.
      // We now assume the connection is ready after attempting to enable persistence.
      // Actual connection errors will be caught by the components that use Firestore.
      setIsReady(true);
    };

    // Check for placeholder API key which indicates incomplete setup.
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

'use client';

import React, { type ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase, type FirebaseServices } from '@/firebase';
import { enableIndexedDbPersistence } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let servicesInstance: FirebaseServices;

    try {
      // Defer initialization to the client side inside useEffect.
      servicesInstance = initializeFirebase();
      
      // Explicitly check for placeholder keys which cause crashes.
      if (servicesInstance.firebaseApp.options.apiKey?.includes('REPLACE_WITH')) {
        throw new Error("Your Firebase configuration contains placeholder values. Please add your project's configuration to `src/firebase/config.ts`.");
      }

      setServices(servicesInstance);

    } catch (e: any) {
      console.error("Firebase Initialization Error:", e);
      setError(`Failed to initialize Firebase. This is often caused by an invalid or incomplete configuration in \`src/firebase/config.ts\`. Please verify your Firebase project details. Raw error: ${e.message}`);
      setIsReady(false); // Make sure we show the error and not the loader
      return;
    }

    const setupPersistence = async () => {
      try {
        await enableIndexedDbPersistence(servicesInstance.firestore);
      } catch (err: any) {
        if (err.code === 'failed-precondition') {
          console.warn('Firestore persistence not enabled: multiple tabs open.');
        } else if (err.code === 'unimplemented') {
          console.warn('Firestore persistence not supported in this browser.');
        } else {
          console.error('Error enabling Firestore persistence:', err);
        }
      }
      setIsReady(true);
    };

    setupPersistence();

  }, []); // Empty dependency array ensures this runs only once on mount

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-4 bg-background">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Application Configuration Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isReady || !services) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Connecting to Services...</p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}

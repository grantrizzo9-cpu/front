'use client';

import React, { type ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { type FirebaseServices } from '@/firebase';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (services) return; // Prevent re-initialization on hot-reloads

    let app: FirebaseApp;
    try {
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      if (app.options.apiKey?.includes('REPLACE_WITH')) {
        throw new Error("Your Firebase configuration contains placeholder values. Please add your project's configuration to `src/firebase/config.ts`.");
      }
    } catch (e: any) {
      console.error("Firebase App Initialization Error:", e);
      setError(`Failed to initialize Firebase App. This is often caused by an invalid or incomplete configuration in \`src/firebase/config.ts\`. Please verify your Firebase project details. Raw error: ${e.message}`);
      return;
    }
    
    const auth = getAuth(app);
    let firestore: Firestore;

    try {
      // Initialize Firestore with persistence settings. This is the new recommended way.
      firestore = initializeFirestore(app, {
        localCache: persistentLocalCache({})
      });
    } catch (e: any) {
      // This can happen with hot-reloading if Firestore is already initialized.
      // In that case, we just get the existing instance.
      if (e.message.includes('already been initialized')) {
        firestore = getFirestore(app);
      } else {
        console.error("Firestore Initialization Error:", e);
        setError(`Failed to initialize Firestore. Raw error: ${e.message}`);
        return;
      }
    }

    setServices({ firebaseApp: app, auth, firestore });

  }, [services]);

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

  if (!services) {
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

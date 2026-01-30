'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { type FirebaseServices } from '@/firebase';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// Module-level cache for Firebase services to ensure they are only initialized once.
let servicesCache: FirebaseServices | null = null;
let initializationError: string | null = null;

/**
 * Initializes and returns Firebase services, ensuring it only happens once.
 * This singleton pattern is robust against React StrictMode and HMR.
 * @returns The initialized Firebase services, or null if an error occurred.
 */
function getInitializedFirebaseServices(): { services: FirebaseServices | null; error: string | null } {
  // If we already have an error, don't try again.
  if (initializationError) {
    return { services: null, error: initializationError };
  }
  // If services are already initialized and cached, return them.
  if (servicesCache) {
    return { services: servicesCache, error: null };
  }

  try {
    // 1. Initialize the Firebase App
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    if (app.options.apiKey?.includes('REPLACE_WITH')) {
        throw new Error("Your Firebase configuration contains placeholder values. Please add your project's configuration to `src/firebase/config.ts`.");
    }
    
    // 2. Get Auth instance
    const auth = getAuth(app);

    // 3. Initialize Firestore with persistence
    // This is the core of the fix. We initialize it here, once.
    let firestore: Firestore;
    try {
        firestore = initializeFirestore(app, {
            localCache: persistentLocalCache({})
        });
    } catch (e: any) {
        // This might happen during hot-reloads if Firestore was already initialized
        // in a previous lifecycle. In that case, we just grab the existing instance.
        if (e.message.includes('already been initialized')) {
            firestore = getFirestore(app);
        } else {
            throw e; // Re-throw other initialization errors
        }
    }

    // Cache the initialized services
    servicesCache = { firebaseApp: app, auth, firestore };
    return { services: servicesCache, error: null };

  } catch (e: any) {
      console.error("Firebase Initialization Error:", e);
      initializationError = `Failed to initialize Firebase. This is often caused by an invalid or incomplete configuration in \`src/firebase/config.ts\`. Please verify your Firebase project details. Raw error: ${e.message}`;
      return { services: null, error: initializationError };
  }
}


export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // This function is now just a stable entry point to get the singleton services.
  const { services, error } = getInitializedFirebaseServices();

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
  
  // This should ideally not happen if the error is caught, but as a safeguard:
  if (!services) {
      return (
         <div className="flex h-screen w-screen items-center justify-center p-4 bg-background">
            <Alert variant="destructive" className="max-w-lg">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Initialization Failed</AlertTitle>
              <AlertDescription>An unknown error occurred during Firebase setup.</AlertDescription>
            </Alert>
        </div>
      )
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

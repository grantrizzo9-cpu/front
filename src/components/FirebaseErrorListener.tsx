'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It logs the error to the console instead of throwing it, to prevent app crashes.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Log the detailed error to the console for debugging purposes.
      // This prevents the entire application from crashing due to a permission issue.
      console.error(
        "Firestore Permission Error Caught:",
        "This error was caught by the global listener. The app will continue to run, but some data may not be available. Check your Firestore security rules and the component making the request.",
        error
      );
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // This component renders nothing.
  return null;
}

'use client';

import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

/**
 * Hook to determine if the current user has admin privileges.
 * It checks for the existence of a document in the /roles_admin/{userId} collection
 * and also includes a hardcoded check for the primary admin user.
 * @returns {object} An object containing a boolean `isAdmin` and a boolean `isLoading`.
 */
export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Always start in a loading state when dependencies change
    setIsLoading(true);

    if (isUserLoading) {
      // We are waiting for Firebase Auth to resolve, so we wait.
      return;
    }

    if (!user) {
      // No user is logged in, so they can't be an admin.
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }
    
    // Check for hardcoded primary admin email. This is the fastest and most reliable check.
    if (user.email === 'rentapog@gmail.com') {
        setIsAdmin(true);
        setIsLoading(false);
        return;
    }

    // If the user is not the hardcoded admin, check for a role document in the database.
    const checkDbRole = async () => {
      try {
        const adminDocRef = doc(firestore, 'roles_admin', user.uid);
        const adminDoc = await getDoc(adminDocRef);
        // The user is an admin if their role document exists.
        setIsAdmin(adminDoc.exists());
      } catch (error) {
        // If there's an error (e.g., permissions), we assume the user is not an admin
        // and log the error instead of crashing the app.
        console.error("An error occurred while checking for admin privileges:", error);
        setIsAdmin(false);
      } finally {
        // Regardless of the outcome, the loading process is complete.
        setIsLoading(false);
      }
    };

    checkDbRole();

  }, [user, isUserLoading, firestore]);


  return { isAdmin, isLoading };
}

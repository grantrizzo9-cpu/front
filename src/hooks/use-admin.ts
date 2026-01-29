'use client';

import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

/**
 * Hook to determine if the current user has admin privileges.
 * It checks for the existence of a document in the /roles_admin/{userId} collection.
 * @returns {object} An object containing a boolean `isAdmin` and a boolean `isLoading`.
 */
export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  // Start in a loading state.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This flag prevents state updates if the component unmounts
    // or if dependencies change before the async operation completes.
    let isMounted = true;

    async function checkAdminStatus() {
      // While the user object is loading, we are also loading.
      if (isUserLoading) {
        if (isMounted) setIsLoading(true);
        return;
      }

      // If there is no user, they are not an admin. We are done loading.
      if (!user) {
        if (isMounted) {
          setIsAdmin(false);
          setIsLoading(false);
        }
        return;
      }
      
      // Special hardcoded check for the primary admin account.
      if (user.email === 'rentapog@gmail.com') {
        if (isMounted) {
          setIsAdmin(true);
          setIsLoading(false);
        }
        return;
      }

      // For all other users, check for a role document in Firestore.
      try {
        const adminDocRef = doc(firestore, 'roles_admin', user.uid);
        const adminDocSnap = await getDoc(adminDocRef);
        
        if (isMounted) {
          // The user is an admin if the document exists.
          setIsAdmin(adminDocSnap.exists());
        }
      } catch (error) {
        // This can happen if there are network issues or, in some edge cases,
        // with permissions before the connection is fully established.
        // We will log the error but treat it as "not an admin" to prevent a crash.
        console.error("An error occurred while checking for admin privileges:", error);
        if (isMounted) {
          setIsAdmin(false);
        }
      } finally {
        // We have a definitive answer (or an error we've handled), so we are no longer loading.
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAdminStatus();

    // Cleanup function to set the flag when the component unmounts.
    return () => {
      isMounted = false;
    };
  }, [user, isUserLoading, firestore]);

  return { isAdmin, isLoading };
}

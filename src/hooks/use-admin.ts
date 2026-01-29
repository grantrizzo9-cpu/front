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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      // We can't know the status until the user is loaded, so we are in a loading state.
      if (isUserLoading) {
        setIsLoading(true);
        return;
      }

      if (!user) {
        // No user, so not an admin. We are done loading.
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // User is loaded, now check the database for the admin role document.
      try {
        const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
        const adminDocSnap = await getDoc(adminRoleRef);
        setIsAdmin(adminDocSnap.exists());
      } catch (error) {
        // This can happen due to network issues or if security rules change.
        // We log the error but default to non-admin for security.
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        // The check is complete.
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [user, isUserLoading, firestore]);

  return { isAdmin, isLoading };
}

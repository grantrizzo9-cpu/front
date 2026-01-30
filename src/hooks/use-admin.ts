
'use client';

import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

/**
 * Hook to determine if the current user has admin privileges.
 * It checks for the existence of a document in the /roles_admin/{userId} collection,
 * and also contains a hardcoded check for the platform owner.
 * @returns {object} An object containing a boolean `isAdmin` and a boolean `isLoading`.
 */
export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (isUserLoading) {
        setIsLoading(true);
        return;
      }

      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);

      // Hardcoded check for the platform owner's email.
      if (user.email === 'rentapog@gmail.com') {
        try {
            // Ensure admin role document exists
            const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
            const adminDocSnap = await getDoc(adminRoleRef);
            if (!adminDocSnap.exists()) {
                await setDoc(adminRoleRef, {});
            }

            // Ensure the user's profile has isAffiliate set to true
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists() && !userDocSnap.data()?.isAffiliate) {
                await updateDoc(userDocRef, { isAffiliate: true });
            }

            setIsAdmin(true);
        } catch (error) {
            console.error("Error setting admin role/affiliate status for owner:", error);
            setIsAdmin(false); // Fail safely
        } finally {
            setIsLoading(false);
        }
        return;
      }

      // If not the hardcoded admin, check the database for an admin role document.
      try {
        const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
        const adminDocSnap = await getDoc(adminRoleRef);
        setIsAdmin(adminDocSnap.exists());
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [user, isUserLoading, firestore]);

  return { isAdmin, isLoading };
}

    


'use client';

import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
            // Ensure admin role document exists. This grants DB permissions.
            const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
            await setDoc(adminRoleRef, {}, { merge: true });

            // Now, ensure the corresponding user profile is complete.
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            // Determine username: use existing one if present, otherwise create a default.
            // This prevents the username from changing on every load if displayName changes.
            const username = userDocSnap.data()?.username || user.displayName || user.email?.split('@')[0] || `admin_${user.uid.substring(0,5)}`;

            const requiredAdminData = {
                username: username,
                isAffiliate: true,
                // We also set email and id to ensure the doc is complete if it's new
                email: user.email,
                id: user.uid,
            };

            // Use set with merge to create or update the user document idempotently.
            // This ensures all required fields are present without overwriting other data
            // like subscription, paypalEmail, etc., if they were added manually.
            await setDoc(userDocRef, requiredAdminData, { merge: true });

            // Finally, ensure the public username mapping exists for the affiliate link to work.
            const usernameDocRef = doc(firestore, 'usernames', username);
            await setDoc(usernameDocRef, { uid: user.uid });

            setIsAdmin(true);
        } catch (error) {
            console.error("Error ensuring admin user profile and role exists:", error);
            setIsAdmin(false); // Fail safely if any DB operation fails
        } finally {
            setIsLoading(false);
        }
        return; // Important: exit after handling the admin user.
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

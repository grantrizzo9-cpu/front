
'use client';

import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
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

            // Ensure the user's profile document exists and is correctly configured
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                // If the user document for the admin doesn't exist, create it.
                // This is crucial for the app to function correctly for the admin user.
                const username = user.displayName || user.email.split('@')[0];
                const adminUserData = {
                    id: user.uid,
                    email: user.email,
                    username: username,
                    isAffiliate: true,
                    createdAt: serverTimestamp(),
                    referredBy: null,
                    subscription: null, // Admins typically don't need a subscription
                    paypalEmail: '',
                    customDomain: null
                };
                await setDoc(userDocRef, adminUserData);

                // Also create the public username document for the affiliate link to work
                const usernameDocRef = doc(firestore, 'usernames', username);
                await setDoc(usernameDocRef, { uid: user.uid });

            } else {
                // If the document exists, ensure the `isAffiliate` flag is true.
                if (!userDocSnap.data().isAffiliate) {
                    await updateDoc(userDocRef, { isAffiliate: true });
                }
            }

            setIsAdmin(true);
        } catch (error) {
            console.error("Error ensuring admin user profile exists:", error);
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

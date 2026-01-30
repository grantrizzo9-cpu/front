
'use client';

import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
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
    async function setupAdminUser() {
        if (!user || !firestore || user.email !== 'rentapog@gmail.com') return;

        setIsLoading(true);
        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
            
            const userDoc = await getDoc(userDocRef);
            let username = userDoc.data()?.username;

            // Step 1: Ensure user has a username. If not, generate a unique one.
            if (!username) {
                let potentialUsername = (user.displayName || user.email?.split('@')[0] || `admin`).replace(/[^a-zA-Z0-9]/g, '');
                let isUsernameUnique = false;
                while (!isUsernameUnique) {
                    const usernameCheckDoc = await getDoc(doc(firestore, "usernames", potentialUsername));
                    if (!usernameCheckDoc.exists()) {
                        isUsernameUnique = true;
                        username = potentialUsername;
                    } else {
                        // If username is taken, add a random number to make it unique
                        potentialUsername = `${potentialUsername}${Math.floor(100 + Math.random() * 900)}`;
                    }
                }
            }
            
            // Step 2: Write all necessary admin documents in a single, atomic batch.
            const batch = writeBatch(firestore);

            // Doc 1: The admin role document itself.
            batch.set(adminRoleRef, {});

            // Doc 2: The user's profile, ensuring key fields are set.
            // Using merge: true makes this operation idempotent.
            batch.set(userDocRef, {
                id: user.uid,
                email: user.email,
                username: username,
                isAffiliate: true,
            }, { merge: true });

            // Doc 3: The public username mapping for the affiliate link.
            const usernameDocRef = doc(firestore, 'usernames', username!);
            batch.set(usernameDocRef, { uid: user.uid });
            
            // Commit all writes at once.
            await batch.commit();

            // If we get here, all writes were successful.
            setIsAdmin(true);
            
        } catch (e) {
            console.error("CRITICAL: Failed to set up admin user. This may be due to security rules.", e);
            setIsAdmin(false);
        } finally {
            setIsLoading(false);
        }
    }

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
        
        // This is the main logic path for the special, hardcoded admin user.
        if (user.email === 'rentapog@gmail.com') {
            await setupAdminUser();
            return;
        }

        // This is the path for any other user who might have an admin role document.
        setIsLoading(true);
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

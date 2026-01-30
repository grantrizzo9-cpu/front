'use client';

import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { useState, useEffect } from 'react';

export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // This effect is ONLY for determining the `isAdmin` state for the UI.
  useEffect(() => {
    setIsLoading(true);

    if (isUserLoading) {
      return;
    }

    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    // PRIMARY check: Hardcoded platform owner email.
    if (user.email === 'rentapog@gmail.com') {
      setIsAdmin(true);
      setIsLoading(false);
      // The separate effect below will handle ensuring the DB is consistent.
      return;
    }

    // SECONDARY check: For any other potential admins, check the database role.
    const checkRoleDoc = async () => {
      try {
        if (!firestore) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }
        const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
        const adminDocSnap = await getDoc(adminRoleRef);
        setIsAdmin(adminDocSnap.exists());
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false); // Default to not admin on error
      } finally {
        setIsLoading(false);
      }
    };

    checkRoleDoc();
  }, [user, isUserLoading, firestore]);

  // This separate effect is a "fire-and-forget" task to ensure the database
  // is consistent for the hardcoded admin user. It does NOT affect the UI's
  // `isAdmin` or `isLoading` state, making the UI more resilient.
  useEffect(() => {
    if (isAdmin && user && user.email === 'rentapog@gmail.com' && firestore) {
      const ensureAdminDbState = async () => {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const adminRoleRef = doc(firestore, 'roles_admin', user.uid);

          const userDoc = await getDoc(userDocRef);
          let username = userDoc.data()?.username;

          if (!username) {
            // Generate a username. If it's taken, add a short UID hash.
            username = (user.displayName || user.email?.split('@')[0] || `admin`).replace(/[^a-zA-Z0-9]/g, '');
            const usernameCheckDoc = await getDoc(doc(firestore, "usernames", username));
            if (usernameCheckDoc.exists() && usernameCheckDoc.data()?.uid !== user.uid) {
                username = `${username}${user.uid.substring(0, 4)}`;
            }
          }

          const batch = writeBatch(firestore);
          const usernameDocRef = doc(firestore, 'usernames', username);

          // Use merge: true to idempotently create or update documents.
          // This is now safe because the security rules will allow admins to update.
          batch.set(userDocRef, {
              id: user.uid,
              email: user.email,
              username: username,
              isAffiliate: true,
          }, { merge: true });
          
          batch.set(adminRoleRef, {}, { merge: true });
          
          batch.set(usernameDocRef, { uid: user.uid }, { merge: true });

          await batch.commit();
          console.log("Admin database state verified and consistent.");

        } catch (e) {
          // This will log errors to the console but will NOT break the UI.
          console.error("Non-critical error during admin DB state verification:", e);
        }
      };

      ensureAdminDbState();
    }
  }, [isAdmin, user, firestore]); // Runs only after isAdmin is confirmed to be true.

  return { isAdmin, isLoading };
}

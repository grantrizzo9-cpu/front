
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

          // Generate a lowercase username if it doesn't exist
          if (!username) {
            username = (user.displayName || user.email?.split('@')[0] || `admin`).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          }
          
          const lowerCaseUsername = username.toLowerCase();
          const usernameDocRef = doc(firestore, 'usernames', lowerCaseUsername);
          const usernameDocSnap = await getDoc(usernameDocRef);

          const batch = writeBatch(firestore);

          // Update the admin's user document.
          batch.set(userDocRef, {
              id: user.uid,
              email: user.email,
              username: lowerCaseUsername,
              isAffiliate: true,
          }, { merge: true });
          
          // Ensure the admin role document exists.
          batch.set(adminRoleRef, {}, { merge: true });

          // Safely check and set the public username document
          if (usernameDocSnap.exists()) {
              // The username document already exists.
              // Check if it belongs to someone else.
              if (usernameDocSnap.data().uid !== user.uid) {
                  // It belongs to someone else. Warn and do not overwrite.
                  console.warn(`Admin's desired username '${lowerCaseUsername}' is already taken by user ${usernameDocSnap.data().uid}. The public username mapping for the admin was NOT created to avoid an overwrite.`);
              } else {
                  // It already exists and belongs to the admin. Re-set it to be safe.
                  batch.set(usernameDocRef, { uid: user.uid });
              }
          } else {
              // The username document does not exist, so we are free to create it.
              batch.set(usernameDocRef, { uid: user.uid });
          }

          await batch.commit();
          console.log("Admin database state verification process completed.");

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

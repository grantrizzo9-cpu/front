
'use client';

import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { subscriptionTiers } from '@/lib/data';

export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlatformOwner, setIsPlatformOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hardcoded list of platform owner emails
  const platformOwnerEmails = ['rentapog@gmail.com', 'grantrizzo2@gmail.com'];

  useEffect(() => {
    setIsLoading(true);
    setIsAdmin(false);
    setIsPlatformOwner(false);

    if (isUserLoading) {
      return;
    }

    if (!user) {
      setIsLoading(false);
      return;
    }

    const email = user.email?.toLowerCase();

    // PRIMARY check: Hardcoded platform owner emails.
    if (email && platformOwnerEmails.includes(email)) {
      setIsAdmin(true);
      setIsPlatformOwner(true);
      setIsLoading(false);
      return;
    }

    // SECONDARY check: For any other potential admins, check the database role.
    const checkRoleDoc = async () => {
      try {
        if (!firestore) {
          setIsLoading(false);
          return;
        }
        const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
        const adminDocSnap = await getDoc(adminRoleRef);
        if (adminDocSnap.exists()) {
          setIsAdmin(true);
          setIsPlatformOwner(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkRoleDoc();
  }, [user, isUserLoading, firestore]);

  // DB Consistency Effect
  useEffect(() => {
    if (isPlatformOwner && user && firestore) {
      const ensureAdminDbState = async () => {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const adminRoleRef = doc(firestore, 'roles_admin', user.uid);

          const userDoc = await getDoc(userDocRef);
          let username = userDoc.data()?.username;

          if (!username) {
            username = (user.displayName || user.email?.split('@')[0] || `admin`).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          }
          
          const lowerCaseUsername = username.toLowerCase();
          const usernameDocRef = doc(firestore, 'usernames', lowerCaseUsername);
          const usernameDocSnap = await getDoc(usernameDocRef);

          const batch = writeBatch(firestore);

          batch.set(userDocRef, {
              id: user.uid,
              email: user.email,
              username: lowerCaseUsername,
              isAffiliate: true,
          }, { merge: true });
          
          batch.set(adminRoleRef, {}, { merge: true });

          if (usernameDocSnap.exists()) {
              if (usernameDocSnap.data()?.uid === user.uid) {
                  batch.set(usernameDocRef, { uid: user.uid });
              }
          } else {
              batch.set(usernameDocRef, { uid: user.uid });
          }

          await batch.commit();
        } catch (e) {
          console.error("Non-critical error during admin DB state verification:", e);
        }
      };

      ensureAdminDbState();
    }
  }, [isPlatformOwner, user, firestore]);

  return { isAdmin, isPlatformOwner, isLoading };
}

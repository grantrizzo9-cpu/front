'use client';

import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { useState, useEffect } from 'react';

export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlatformOwner, setIsPlatformOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hardcoded list of platform owner emails
  const platformOwnerEmails = ['rentapog@gmail.com', 'grantrizzo2@gmail.com'];

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      setIsAdmin(false);
      setIsPlatformOwner(false);
      setIsLoading(false);
      return;
    }

    const email = user.email?.toLowerCase();

    // PRIMARY check: Hardcoded platform owner emails (Instant)
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

  // Optimized DB Consistency: Only run if state is actually missing
  useEffect(() => {
    if (isPlatformOwner && user && firestore && !isLoading) {
      const ensureAdminDbState = async () => {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          // Only perform the write if the document doesn't exist or is missing critical info
          if (!userDoc.exists() || !userDoc.data()?.isAffiliate) {
            const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
            let username = userDoc.data()?.username || (user.displayName || user.email?.split('@')[0] || `admin`).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            
            const batch = writeBatch(firestore);
            batch.set(userDocRef, {
                id: user.uid,
                email: user.email,
                username: username,
                isAffiliate: true,
            }, { merge: true });
            
            batch.set(adminRoleRef, {}, { merge: true });
            batch.set(doc(firestore, 'usernames', username), { uid: user.uid }, { merge: true });
            
            await batch.commit();
            console.log("Admin DB state verified and updated.");
          }
        } catch (e) {
          console.warn("Non-critical admin state sync error:", e);
        }
      };

      ensureAdminDbState();
    }
  }, [isPlatformOwner, user, firestore, isLoading]);

  return { isAdmin, isPlatformOwner, isLoading };
}

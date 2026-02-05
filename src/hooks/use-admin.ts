'use client';

import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

/**
 * Optimized Admin Hook (v1.0.7)
 * Prioritizes hardcoded checks for instant results.
 */
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

    // 1. Instant check for Platform Owners
    if (email && platformOwnerEmails.includes(email)) {
      setIsAdmin(true);
      setIsPlatformOwner(true);
      setIsLoading(false);
      return;
    }

    // 2. Database check for secondary admins (Non-blocking)
    const checkRoleDoc = async () => {
      try {
        if (!firestore) return;
        const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
        const adminDocSnap = await getDoc(adminRoleRef);
        if (adminDocSnap.exists()) {
          setIsAdmin(true);
        }
      } catch (error) {
        // Silent catch for performance
      } finally {
        setIsLoading(false);
      }
    };

    checkRoleDoc();
  }, [user?.uid, isUserLoading, firestore]);

  return { isAdmin, isPlatformOwner, isLoading };
}

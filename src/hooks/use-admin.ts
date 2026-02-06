
'use client';

import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

/**
 * Absolute-Velocity Admin Hook (v1.1.8)
 * Immediate bypass for hardcoded platform owners.
 */
export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlatformOwner, setIsPlatformOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Platform owner emails for zero-latency bypass
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

    // 1. IMMEDIATE BYPASS - No database round-trip for platform owners
    if (email && platformOwnerEmails.includes(email)) {
      setIsAdmin(true);
      setIsPlatformOwner(true);
      setIsLoading(false);
      return;
    }

    // 2. DATABASE CHECK for secondary admins
    const checkRoleDoc = async () => {
      try {
        if (!firestore) return;
        const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
        const adminDocSnap = await getDoc(adminRoleRef);
        if (adminDocSnap.exists()) {
          setIsAdmin(true);
        }
      } catch (error) {
        // Silent catch
      } finally {
        setIsLoading(false);
      }
    };

    checkRoleDoc();
  }, [user?.uid, isUserLoading, firestore]);

  return { isAdmin, isPlatformOwner, isLoading };
}

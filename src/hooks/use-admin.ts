'use client';

import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

/**
 * Max-Speed Admin Hook (v1.1.4)
 * Optimized for high-velocity platform owners and secure role verification.
 * Enables zero-latency dashbord UI rendering.
 */
export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlatformOwner, setIsPlatformOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hardcoded list of platform owner emails for instant verification
  const platformOwnerEmails = ['rentapog@gmail.com', 'grantrizzo2@gmail.com'];

  useEffect(() => {
    // If the user hasn't loaded yet, keep loading
    if (isUserLoading) return;

    // If no user is logged in, reset and stop loading
    if (!user) {
      setIsAdmin(false);
      setIsPlatformOwner(false);
      setIsLoading(false);
      return;
    }

    const email = user.email?.toLowerCase();

    // 1. HIGH-SPEED PATH: Instant check for Platform Owners
    if (email && platformOwnerEmails.includes(email)) {
      setIsAdmin(true);
      setIsPlatformOwner(true);
      setIsLoading(false);
      return;
    }

    // 2. SECURE PATH: Database check for secondary/invited admins
    const checkRoleDoc = async () => {
      try {
        if (!firestore) return;
        // Check cache first for instant repeat visits
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
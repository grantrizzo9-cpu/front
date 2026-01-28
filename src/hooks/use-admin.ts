'use client';

import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * Hook to determine if the current user has admin privileges.
 * It checks for the existence of a document in the /roles_admin/{userId} collection.
 * It also contains a hardcoded check for the primary admin user.
 * @returns {object} An object containing a boolean `isAdmin` and a boolean `isLoading`.
 */
export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // FORCED ADMIN CHECK: This is the primary check for the main administrator.
  // This bypasses any database reads to ensure the admin is always recognized.
  if (user && (user.email === 'rentapog@gmail.com' || user.displayName === 'rentahost')) {
      return { isAdmin: true, isLoading: false };
  }

  // Standard database check for other potential admins.
  const adminDocRef = useMemoFirebase(() => {
    if (!user?.uid) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user?.uid]);

  const { data: adminDoc, isLoading: isAdminLoading } = useDoc(adminDocRef);

  const isAdmin = !!adminDoc;
  const isLoading = isUserLoading || (!!user && isAdminLoading);

  return { isAdmin, isLoading };
}

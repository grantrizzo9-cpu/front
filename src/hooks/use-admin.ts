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

  const adminDocRef = useMemoFirebase(() => {
    if (!user?.uid) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user?.uid]);

  const { data: adminDoc, isLoading: isAdminDocLoading } = useDoc(adminDocRef);

  const isHardcodedAdmin = user?.email === 'grantrizzo2@gmail.com' || user?.displayName === 'rentahost';
  
  const isAdminByDb = !!adminDoc;

  const isAdmin = isHardcodedAdmin || isAdminByDb;
  
  // Loading is true if we are still waiting on the user object, or if we are waiting on the admin doc.
  // However, we don't need to wait for the admin doc if the user is the hardcoded admin.
  const isLoading = isUserLoading || (!isHardcodedAdmin && isAdminDocLoading);

  return { isAdmin, isLoading };
}

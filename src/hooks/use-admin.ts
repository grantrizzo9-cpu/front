'use client';

import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * Hook to determine if the current user has admin privileges.
 * It checks for the existence of a document in the /roles_admin/{userId} collection.
 * @returns {object} An object containing a boolean `isAdmin` and a boolean `isLoading`.
 */
export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const adminDocRef = useMemoFirebase(() => {
    if (!user?.uid) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user?.uid]);

  const { data: adminDoc, isLoading: isAdminLoading } = useDoc(adminDocRef);

  const isAdmin = !!adminDoc;
  const isLoading = isUserLoading || (!!user && isAdminLoading);

  return { isAdmin, isLoading };
}

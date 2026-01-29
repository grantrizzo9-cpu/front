
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

  // We should not decide anything until the user loading is complete.
  const isHardcodedAdmin = !isUserLoading && (user?.email === 'rentapog@gmail.com' || user?.displayName === 'rentahost');

  // Also, don't try to get a doc ref while user is loading.
  const adminDocRef = useMemoFirebase(() => {
    if (isUserLoading || isHardcodedAdmin || !user?.uid) {
      return null;
    }
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user?.uid, isUserLoading, isHardcodedAdmin]);

  // This hook will now only run if adminDocRef is not null.
  const { data: adminDoc, isLoading: isAdminDocLoading } = useDoc(adminDocRef);

  const isAdminByDb = !!adminDoc;

  // The user is an admin if they pass either the hardcoded check or the database check.
  const isAdmin = isHardcodedAdmin || isAdminByDb;
  
  // The final loading state depends on user loading AND the potential db doc loading.
  const isLoading = isUserLoading || isAdminDocLoading;

  return { isAdmin, isLoading };
}

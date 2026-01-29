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

  // Perform the hardcoded check first. This user is always an admin.
  const isHardcodedAdmin = user?.email === 'rentapog@gmail.com' || user?.displayName === 'rentahost';

  // Only create a reference and perform a DB query if the user is NOT a hardcoded admin.
  const adminDocRef = useMemoFirebase(() => {
    if (isHardcodedAdmin || !user?.uid) {
      return null;
    }
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user?.uid, isHardcodedAdmin]);

  // This hook will now only run if adminDocRef is not null.
  const { data: adminDoc, isLoading: isAdminDocLoading } = useDoc(adminDocRef);

  const isAdminByDb = !!adminDoc;

  // The user is an admin if they pass either the hardcoded check or the database check.
  const isAdmin = isHardcodedAdmin || isAdminByDb;
  
  // We are loading if the user object is loading, OR if we are not a hardcoded admin and we are still waiting for the database check.
  const isLoading = isUserLoading || (!isHardcodedAdmin && isAdminDocLoading);

  return { isAdmin, isLoading };
}


'use client';

import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { subscriptionTiers } from '@/lib/data';

export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPlatformOwner, setIsPlatformOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // This effect is ONLY for determining the `isAdmin` and `isPlatformOwner` state for the UI.
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

    // PRIMARY check: Hardcoded platform owner email.
    if (user.email?.toLowerCase() === 'grantrizzo2@gmail.com') {
      setIsAdmin(true);
      setIsPlatformOwner(true);
      setIsLoading(false);
      // The separate effect below will handle ensuring the DB is consistent.
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
          setIsAdmin(true); // They are an admin
          setIsPlatformOwner(false); // But not the owner
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkRoleDoc();
  }, [user, isUserLoading, firestore]);

  // This separate effect is a "fire-and-forget" task to ensure the database
  // is consistent for the hardcoded admin user. It does NOT affect the UI's
  // `isAdmin` or `isLoading` state, making the UI more resilient.
  useEffect(() => {
    if (isPlatformOwner && user && firestore) {
      const ensureAdminDbState = async () => {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const adminRoleRef = doc(firestore, 'roles_admin', user.uid);

          const userDoc = await getDoc(userDocRef);
          let username = userDoc.data()?.username;

          // Generate a lowercase username if it doesn't exist
          if (!username) {
            username = (user.displayName || user.email?.split('@')[0] || `admin`).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          }
          
          const lowerCaseUsername = username.toLowerCase();
          const usernameDocRef = doc(firestore, 'usernames', lowerCaseUsername);
          const usernameDocSnap = await getDoc(usernameDocRef);

          const batch = writeBatch(firestore);

          // Update the admin's user document.
          batch.set(userDocRef, {
              id: user.uid,
              email: user.email,
              username: lowerCaseUsername,
              isAffiliate: true,
          }, { merge: true });
          
          // Ensure the admin role document exists.
          batch.set(adminRoleRef, {}, { merge: true });

          // Safely check and set the public username document
          if (usernameDocSnap.exists()) {
              // The username document already exists.
              // Check if it belongs to someone else.
              if (usernameDocSnap.data()?.uid !== user.uid) {
                  // It belongs to someone else. Warn and do not overwrite.
                  console.warn(`Admin's desired username '${lowerCaseUsername}' is already taken by user ${usernameDocSnap.data()?.uid}. The public username mapping for the admin was NOT created to avoid an overwrite.`);
              } else {
                  // It already exists and belongs to the admin. Re-set it to be safe.
                  batch.set(usernameDocRef, { uid: user.uid });
              }
          } else {
              // The username document does not exist, so we are free to create it.
              batch.set(usernameDocRef, { uid: user.uid });
          }

          await batch.commit();
          console.log("Admin database state verification process completed.");

        } catch (e) {
          // This will log errors to the console but will NOT break the UI.
          console.error("Non-critical error during admin DB state verification:", e);
        }
      };

      ensureAdminDbState();
    }
  }, [isPlatformOwner, user, firestore]);

  // This effect handles automatically upgrading other admins (not the owner) to the top tier.
  useEffect(() => {
    if (isAdmin && !isPlatformOwner && user && firestore) {
      const upgradeAdminAccount = async () => {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) return;

          const userData = userDoc.data();
          const highestTier = subscriptionTiers.sort((a, b) => b.price - a.price)[0];
          
          // Only upgrade if they are not already on the highest tier.
          if (userData.subscription?.tierId !== highestTier.id) {
            const batch = writeBatch(firestore);
            
            const newSubscriptionData = {
              tierId: highestTier.id,
              status: 'active' as const,
              startDate: serverTimestamp(),
              endDate: null,
              trialEndDate: null, // Admins don't need trials
              paypalSubscriptionId: `admin_comp_${user.uid}`, // A non-real ID to indicate it's a complimentary admin plan
            };

            batch.set(userDocRef, { subscription: newSubscriptionData }, { merge: true });
            await batch.commit();
            console.log(`Admin user ${user.uid} automatically upgraded to ${highestTier.name} plan.`);
          }
        } catch (e) {
          console.error(`Failed to auto-upgrade admin ${user.uid}:`, e);
        }
      };

      upgradeAdminAccount();
    }
  }, [isAdmin, isPlatformOwner, user, firestore]);

  return { isAdmin, isPlatformOwner, isLoading };
}

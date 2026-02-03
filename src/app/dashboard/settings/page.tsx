
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Loader2, PartyPopper, Info, Mail } from "lucide-react";
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { doc, writeBatch } from "firebase/firestore";
import { verifyBeforeUpdateEmail } from "firebase/auth";
import type { User as UserType } from "@/lib/types";
import { useState, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAdmin } from "@/hooks/use-admin";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();

  const [isRepairing, setIsRepairing] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  // Check if the public username document exists, ALWAYS using lowercase
  const usernameDocRef = useMemoFirebase(() => {
    if (!userData?.username || !firestore) return null;
    return doc(firestore, "usernames", userData.username.toLowerCase());
  }, [firestore, userData?.username]);
  const { data: usernameDoc, isLoading: isUsernameDocLoading } = useDoc<{uid: string}>(usernameDocRef);

  const affiliateLink = userData?.username ? `https://hostproai.com/?ref=${userData.username.toLowerCase()}` : '';
  
  // A link is active AND correct if the public username doc exists AND its UID matches the current user's UID.
  const isLinkPubliclyRegistered = !!usernameDoc;
  const isLinkOwnedByCurrentUser = usernameDoc?.uid === user?.uid;
  const isLinkActiveAndCorrect = isLinkPubliclyRegistered && isLinkOwnedByCurrentUser;

  const isGoogleUser = useMemo(() => {
      return user?.providerData.some(p => p.providerId === 'google.com');
  }, [user]);

  const handleCopyLink = () => {
    if (affiliateLink) {
      navigator.clipboard.writeText(affiliateLink);
      toast({
        title: "Copied to Clipboard!",
        description: "Your affiliate link has been copied.",
      });
    }
  };
  
  const handleBecomeAffiliate = () => {
      if (!userDocRef) return;
      updateDocumentNonBlocking(userDocRef, { isAffiliate: true });
      toast({
          title: "Congratulations!",
          description: "You are now an affiliate. Your referral link is active."
      });
  }

  const handleRepairLink = async () => {
    if (!firestore || !user || !userData?.username || !userDocRef) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not repair link. User data is missing.' });
        return;
    }
    setIsRepairing(true);
    try {
        const batch = writeBatch(firestore);
        const lowerCaseUsername = userData.username.toLowerCase();

        // 1. Update the user's profile to store the lowercase username
        batch.update(userDocRef, { username: lowerCaseUsername });

        // 2. Create/overwrite the public username document with the lowercase version, pointing to the correct UID
        const publicUsernameRef = doc(firestore, 'usernames', lowerCaseUsername);
        batch.set(publicUsernameRef, { uid: user.uid });

        await batch.commit();

        toast({ title: 'Success!', description: 'Your affiliate link has been repaired and is now active.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Repair Failed', description: error.message || 'An unknown error occurred.' });
    } finally {
        setIsRepairing(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEmail) return;
    
    setIsUpdatingEmail(true);
    try {
        // Modern Firebase security requirements: verify the new email before it's updated.
        await verifyBeforeUpdateEmail(user, newEmail);
        
        // We update the Firestore document email now so the UI reflects the change requested.
        // The actual Auth login email will update once the user clicks the verification link.
        if (userDocRef) {
            updateDocumentNonBlocking(userDocRef, { email: newEmail });
        }
        
        toast({
            title: "Verification Sent",
            description: `A verification link has been sent to ${newEmail}. Please click the link in your inbox to complete the update.`,
        });
        setNewEmail('');
    } catch (error: any) {
        console.error("Email update error:", error);
        let message = "An error occurred while updating your email.";
        
        if (error.code === 'auth/requires-recent-login') {
            message = "This operation is sensitive and requires recent authentication. Please log out and log back in, then try again.";
        } else if (error.code === 'auth/operation-not-allowed') {
            message = "Email updates are currently restricted. Please ensure you are following the verification link sent to your inbox.";
        } else if (error.message) {
            message = error.message;
        }
        
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: message,
        });
    } finally {
        setIsUpdatingEmail(false);
    }
  };

  const isLoading = isUserLoading || isUserDataLoading || isUsernameDocLoading || isAdminLoading;
  
  // The repair UI should be shown if the user is an affiliate, but their link is not active and correct.
  const showRepairUI = userData?.isAffiliate && !isLinkActiveAndCorrect && !isLoading;


  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-full p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account and affiliate settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Update your login email address.</CardDescription>
        </CardHeader>
        <CardContent>
          {isGoogleUser ? (
              <Alert className="bg-muted">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Google Account Connected</AlertTitle>
                  <AlertDescription>
                      Your account is managed by Google. To change your email address, please update it through your <a href="https://myaccount.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Google Account settings</a>.
                  </AlertDescription>
              </Alert>
          ) : (
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="current-email">Current Email</Label>
                    <Input id="current-email" type="email" value={user?.email || ''} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-email">New Email Address</Label>
                    <div className="flex gap-2">
                        <Input 
                            id="new-email" 
                            type="email" 
                            placeholder="new-email@example.com" 
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                            disabled={isUpdatingEmail}
                        />
                        <Button type="submit" disabled={isUpdatingEmail || !newEmail}>
                            {isUpdatingEmail ? <Loader2 className="animate-spin h-4 w-4" /> : <Mail className="h-4 w-4 mr-2" />}
                            Update
                        </Button>
                    </div>
                </div>
              </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Affiliate Status</CardTitle>
          <CardDescription>Check if your account is enabled for the affiliate program.</CardDescription>
        </CardHeader>
        <CardContent>
          {userData?.isAffiliate ? (
             <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
                <PartyPopper className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">Your affiliate account is active.</p>
                    <p className="text-sm text-green-700 dark:text-green-300">You are ready to earn commissions.</p>
                </div>
            </div>
          ) : (
             <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800">
                 <div>
                    <p className="font-semibold text-amber-800 dark:text-amber-200">Your affiliate account is not active.</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">Enable it below to start earning referrals.</p>
                </div>
            </div>
          )}
        </CardContent>
        {!userData?.isAffiliate && (
            <CardFooter>
                <Button onClick={handleBecomeAffiliate}>Become an Affiliate</Button>
            </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Affiliate Link</CardTitle>
          <CardDescription>Share this link to refer new users and earn commissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input type="text" value={affiliateLink} readOnly disabled={!userData?.isAffiliate} placeholder={userData?.isAffiliate ? '' : 'Enable affiliate account to get your link'} />
            <Button variant="outline" size="icon" onClick={handleCopyLink} disabled={!affiliateLink || !userData?.isAffiliate}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {showRepairUI && (
            <Alert variant="destructive" className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Your Affiliate Link is Inactive!</AlertTitle>
                <AlertDescription>
                    Your public affiliate username is not correctly linked to your account. This will prevent you from receiving credit for referrals. Click the button below to reclaim your link.
                    <Button 
                        onClick={handleRepairLink} 
                        className="mt-2 w-full"
                        disabled={isRepairing}
                    >
                        {isRepairing ? <Loader2 className="animate-spin" /> : "Repair Affiliate Link"}
                    </Button>
                </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

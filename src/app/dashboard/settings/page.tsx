"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Loader2, PartyPopper, Info, Mail, AlertCircle, LogOut, CheckCircle2, ShieldCheck, Server } from "lucide-react";
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking, useMemoFirebase, useAuth } from "@/firebase";
import { doc, writeBatch } from "firebase/firestore";
import { verifyBeforeUpdateEmail, signOut } from "firebase/auth";
import type { User as UserType } from "@/lib/types";
import { useState, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAdmin } from "@/hooks/use-admin";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/accordion";

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { isPlatformOwner, isLoading: isAdminLoading } = useAdmin();
  const router = useRouter();

  const [isRepairing, setIsRepairing] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [showRecentLoginError, setShowRecentLoginError] = useState(false);
  const [verificationSentTo, setVerificationSentTo] = useState<string | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  const usernameDocRef = useMemoFirebase(() => {
    if (!userData?.username || !firestore) return null;
    return doc(firestore, "usernames", userData.username.toLowerCase());
  }, [firestore, userData?.username]);
  const { data: usernameDoc, isLoading: isUsernameDocLoading } = useDoc<{uid: string}>(usernameDocRef);

  const affiliateLink = userData?.username ? `https://hostproai.com/?ref=${userData.username.toLowerCase()}` : '';
  
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
        batch.update(userDocRef, { username: lowerCaseUsername });
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
    setShowRecentLoginError(false);
    setVerificationSentTo(null);

    try {
        await verifyBeforeUpdateEmail(user, newEmail);
        setVerificationSentTo(newEmail);
        toast({
            title: "Check Your Inbox",
            description: `A verification link has been sent to ${newEmail}.`,
        });
        setNewEmail('');
    } catch (error: any) {
        console.error("Email update error:", error);
        let message = "An error occurred while updating your email.";
        
        if (error.code === 'auth/requires-recent-login') {
            setShowRecentLoginError(true);
            message = "Security check: Please log out and log back in to verify your identity before changing your email.";
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

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.push("/login");
    });
  };

  const isLoading = isUserLoading || isUserDataLoading || isUsernameDocLoading || isAdminLoading;
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

      {isPlatformOwner && (
          <Card className="border-primary/50 bg-primary/5 overflow-hidden">
              <CardHeader className="bg-primary/10">
                  <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      Administrator Technical Guide
                  </CardTitle>
                  <CardDescription>Troubleshooting, AWS Hosting, and Account Isolation.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="aws">
                          <AccordionTrigger className="text-sm font-semibold text-left">
                              <div className="flex items-center gap-2">
                                  <Server className="h-4 w-4" />
                                  Host everything on Amazon (AWS)
                              </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-sm space-y-3 text-muted-foreground">
                              <p>If you cannot activate Firebase Hosting due to billing restrictions, you can host the frontend on AWS Amplify for free while keeping the backend here.</p>
                              <div className="space-y-2 border-l-2 border-orange-500/20 pl-4 py-2">
                                  <p className="font-semibold text-foreground">AWS Amplify Setup:</p>
                                  <ol className="list-decimal list-inside space-y-1">
                                      <li>Push your latest code to <strong>GitHub</strong>.</li>
                                      <li>Log into <strong>AWS Amplify</strong> console.</li>
                                      <li>Click "Create new app" &rarr; "GitHub" and select your repository.</li>
                                      <li><strong>Critical:</strong> Under App Settings &rarr; Environment Variables, manually add your <code>GEMINI_API_KEY</code> and PayPal keys.</li>
                                      <li>Deploy. Amplify will provide a live URL instantly.</li>
                                  </ol>
                              </div>
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="clean-break">
                          <AccordionTrigger className="text-sm font-semibold text-left">
                              <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4" />
                                  Rules for a "Clean Break" Account
                              </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-sm space-y-3 text-muted-foreground">
                              <p>To avoid Google linking your new account to restricted ones, follow these rules strictly:</p>
                              <div className="space-y-2 border-l-2 border-primary/20 pl-4 py-2">
                                  <ul className="list-disc list-inside space-y-1">
                                      <li><strong>New Payment Method:</strong> Use a card never used with Google before.</li>
                                      <li><strong>New Phone Number:</strong> Google verifies identity via SMS. Do not reuse your old number.</li>
                                      <li><strong>New Device/IP:</strong> Create the account on a different device or use a VPN/Mobile Hotspot to avoid IP linking.</li>
                                  </ul>
                              </div>
                          </AccordionContent>
                      </AccordionItem>
                  </Accordion>
              </CardContent>
          </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Update your login email address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showRecentLoginError && (
              <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Action Required: Recent Login Needed</AlertTitle>
                  <AlertDescription className="space-y-3">
                      <p>To protect your account, Firebase requires you to have logged in recently to perform this change.</p>
                      <Button variant="outline" size="sm" onClick={handleLogout} className="bg-destructive/10 hover:bg-destructive/20 border-destructive/20 text-destructive">
                          <LogOut className="mr-2 h-4 w-4" /> Log out and sign back in
                      </Button>
                  </AlertDescription>
              </Alert>
          )}

          {verificationSentTo && (
              <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800 dark:text-green-200 font-bold">Verification Link Sent!</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                      <p>We've sent a confirmation link to <strong>{verificationSentTo}</strong>. Your account email will not change until you click that link.</p>
                  </AlertDescription>
              </Alert>
          )}

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
                {!verificationSentTo && (
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
                )}
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
                    Your public affiliate username is not correctly linked to your account.
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
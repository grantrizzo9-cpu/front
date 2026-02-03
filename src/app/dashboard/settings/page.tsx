"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Loader2, PartyPopper, Info, Mail, AlertCircle, LogOut, CheckCircle2, HelpCircle, ShieldCheck, ExternalLink, CreditCard } from "lucide-react";
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
} from "@/components/ui/accordion";
import Link from "next/link";

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { isAdmin, isPlatformOwner, isLoading: isAdminLoading } = useAdmin();
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
        } else if (error.code === 'auth/operation-not-allowed') {
            message = "Email updates are restricted in the Firebase Console settings.";
        } else if (error.code === 'auth/invalid-email') {
            message = "The email address you entered is not valid.";
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

      {/* ADMIN TECHNICAL GUIDE SECTION */}
      {isPlatformOwner && (
          <Card className="border-primary/50 bg-primary/5 overflow-hidden">
              <CardHeader className="bg-primary/10">
                  <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      Administrator Technical Guide
                  </CardTitle>
                  <CardDescription>Common setup tasks and project "linking" instructions.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="billing-permissions">
                          <AccordionTrigger className="text-sm font-semibold text-destructive text-left">Error: "No available billing accounts"?</AccordionTrigger>
                          <AccordionContent className="text-sm space-y-3 text-muted-foreground">
                              <p>If you see "No available billing accounts" in Google Cloud, it means your account is an owner of the project but doesn't have permission to use the <strong>Billing Account</strong> itself.</p>
                              <div className="space-y-2">
                                  <p className="font-semibold text-foreground">How to fix it:</p>
                                  <ol className="list-decimal list-inside space-y-1">
                                      <li>Go to the <a href="https://console.cloud.google.com/billing" target="_blank" className="text-primary underline">Billing Management page</a>.</li>
                                      <li>Click on <strong>"Account Management"</strong> in the left sidebar.</li>
                                      <li>Look at the <strong>"Permissions"</strong> panel on the right.</li>
                                      <li>Click <strong>"ADD PRINCIPAL"</strong> and enter your email address.</li>
                                      <li>In the <strong>"Role"</strong> box, select <strong>Billing > Billing Account Administrator</strong>.</li>
                                      <li>Save, then go back to the "Projects" tab and you will now be able to link your project.</li>
                                  </ol>
                              </div>
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="billing-hang">
                          <AccordionTrigger className="text-sm font-semibold">Stuck on "Waiting for Billing Account"?</AccordionTrigger>
                          <AccordionContent className="text-sm space-y-3 text-muted-foreground">
                              <p>If the publisher is stuck on Step 2 even after you've paid, it's usually because the <strong>project</strong> isn't manually linked to your <strong>Billing Account</strong> yet.</p>
                              <div className="space-y-2">
                                  <p className="font-semibold text-foreground">How to fix it:</p>
                                  <ol className="list-decimal list-inside space-y-1">
                                      <li>Go to the <a href="https://console.cloud.google.com/billing/projects" target="_blank" className="text-primary underline">Cloud Billing Projects page</a>.</li>
                                      <li>Find your project (<code>affiliate-ai-host-new</code>).</li>
                                      <li>Click the three dots (Actions) next to it and select <strong>"Change billing"</strong>.</li>
                                      <li>Select your active billing account and click <strong>"Set Account"</strong>.</li>
                                  </ol>
                                  <p>Wait 60 seconds after linking, then refresh your deployment tool.</p>
                              </div>
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="linking">
                          <AccordionTrigger className="text-sm font-semibold">Cloud vs Firebase: Linking Your Account</AccordionTrigger>
                          <AccordionContent className="text-sm space-y-3 text-muted-foreground">
                              <p><strong>They are already linked!</strong> Every Firebase project is a Google Cloud project. If you don't see your project in Cloud, ensure you are logged into the same Google Account in both tabs.</p>
                              <div className="space-y-2">
                                  <p className="font-semibold text-foreground">Why link Billing?</p>
                                  <p>To use paid features (AI generators, high-volume hosting), you must link a <strong>Billing Account</strong> in the Google Cloud Console.</p>
                                  <Button asChild variant="outline" size="sm" className="w-full">
                                      <Link href="https://console.cloud.google.com/billing" target="_blank">
                                          Open Cloud Billing <ExternalLink className="ml-2 h-3 w-3" />
                                      </Link>
                                  </Button>
                              </div>
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="emails">
                          <AccordionTrigger className="text-sm font-semibold">Fixing "Sender Name" & Verification</AccordionTrigger>
                          <AccordionContent className="text-sm space-y-3 text-muted-foreground">
                              <p>If Cloud won't let you change your "Public Name" due to verification, use this shortcut to fix your emails immediately:</p>
                              <ol className="list-decimal list-inside space-y-1">
                                  <li>Go to <strong>Auth &gt; Templates</strong> in Firebase.</li>
                                  <li>Edit any template (e.g., Email address change).</li>
                                  <li>In the <strong>Sender</strong> section, click the pencil.</li>
                                  <li>Update <strong>Display Name</strong> to "Affiliate AI Host".</li>
                              </ol>
                              <Button asChild variant="outline" size="sm" className="w-full">
                                  <Link href="https://console.firebase.google.com/project/_/authentication/emails" target="_blank">
                                      Open Auth Templates <ExternalLink className="ml-2 h-3 w-3" />
                                  </Link>
                              </Button>
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="spam">
                          <AccordionTrigger className="text-sm font-semibold">Prevent Emails from Going to Spam</AccordionTrigger>
                          <AccordionContent className="text-sm space-y-2 text-muted-foreground">
                              <p>To ensure your users receive emails, you must authorize your domain (DKIM/SPF):</p>
                              <ol className="list-decimal list-inside">
                                  <li>Go to <strong>Auth &gt; Templates</strong>.</li>
                                  <li>Click <strong>"customize domain"</strong> next to the sender.</li>
                                  <li>Enter <code>hostproai.com</code> and add the provided DNS records to your registrar.</li>
                              </ol>
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
                      <p>To protect your account, Firebase requires you to have logged in recently to perform this change. Please log out and sign back in to continue.</p>
                      <Button variant="outline" size="sm" onClick={handleLogout} className="bg-destructive/10 hover:bg-destructive/20 border-destructive/20 text-destructive">
                          <LogOut className="mr-2 h-4 w-4" /> Log out and sign back in
                      </Button>
                  </AlertDescription>
              </Alert>
          )}

          {verificationSentTo && (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800 dark:text-green-200 font-bold">Verification Link Sent!</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-300">
                        <p>We've sent a confirmation link to <strong>{verificationSentTo}</strong>. Your account email will not change until you click that link.</p>
                    </AlertDescription>
                </Alert>

                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-amber-600" />
                            Didn't get the email?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground space-y-2 pb-3">
                        <p>• Check your <strong>Spam or Junk</strong> folder.</p>
                        <p>• Wait up to 5 minutes for the internet to deliver the message.</p>
                        <p>• Ensure you typed the email correctly: <strong>{verificationSentTo}</strong>.</p>
                    </CardContent>
                </Card>
              </div>
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
                {verificationSentTo && (
                    <Button variant="ghost" size="sm" onClick={() => setVerificationSentTo(null)} className="text-xs">
                        Change email address or resend
                    </Button>
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

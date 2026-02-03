"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Loader2, PartyPopper, Info, Mail, AlertCircle, LogOut, CheckCircle2, HelpCircle, ShieldCheck, ExternalLink, CreditCard, RefreshCcw } from "lucide-react";
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
                  <CardDescription>Troubleshooting and support for platform owners.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="suspension">
                          <AccordionTrigger className="text-sm font-semibold text-destructive text-left">Account Suspended or Restricted?</AccordionTrigger>
                          <AccordionContent className="text-sm space-y-3 text-muted-foreground">
                              <p>If Google has restricted your account, it is almost always due to automated <strong>Identity Verification</strong> or <strong>Payment Verification</strong> flags.</p>
                              <div className="space-y-2 border-l-2 border-destructive/20 pl-4 py-2">
                                  <p className="font-semibold text-foreground">Important: Multiple Accounts policy</p>
                                  <p>Google may restrict new accounts if they are linked to older accounts with outstanding billing issues. If this happens, your best path forward is to start fresh with a completely new email and project configuration.</p>
                                  <p className="font-semibold text-foreground">Your code is safe!</p>
                                  <p>The code we've built here is separate from your Firebase account. You can create a new project in a new Firebase account, and we can simply swap the configuration to point to the new one. Your app will be back online in minutes.</p>
                              </div>
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="clean-break">
                          <AccordionTrigger className="text-sm font-semibold text-left">The "Clean Break" Checklist</AccordionTrigger>
                          <AccordionContent className="text-sm space-y-3 text-muted-foreground">
                              <p>To prevent Google's systems from linking a new project to old restricted accounts, follow these steps exactly:</p>
                              <div className="space-y-4">
                                  <div className="p-3 bg-secondary/50 rounded-lg border">
                                      <p className="font-semibold text-foreground mb-2">Phase 1: Creation (The Most Critical)</p>
                                      <ul className="list-decimal list-inside space-y-1">
                                          <li><strong>New Device & Network:</strong> Have a friend create the Gmail and Firebase project on their computer and home network (not your hotspot).</li>
                                          <li><strong>New Phone Number:</strong> Use a phone number that has never been linked to your restricted accounts.</li>
                                          <li><strong>New Payment Method:</strong> <strong>CRITICAL.</strong> Use a credit card that has never been used with Google before.</li>
                                      </ul>
                                  </div>
                                  <div className="p-3 bg-secondary/50 rounded-lg border">
                                      <p className="font-semibold text-foreground mb-2">Phase 2: Usage (On Your Laptop)</p>
                                      <p>Even if you are on the same hotspot, you can avoid linking by isolating your browser:</p>
                                      <ul className="list-decimal list-inside space-y-1">
                                          <li><strong>New Browser Profile:</strong> In Chrome, create a brand new "Profile" (the icon next to the address bar). This ensures NO cookies or history from your old accounts are sent to Google.</li>
                                          <li><strong>Switch Browsers:</strong> If you used Chrome, switch to Firefox or Edge specifically for this new account.</li>
                                          <li><strong>Avoid Old Logins:</strong> Never log into your old restricted Gmail accounts in the same browser window where you use the new one.</li>
                                      </ul>
                                  </div>
                              </div>
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="billing-permissions">
                          <AccordionTrigger className="text-sm font-semibold text-destructive text-left">Error: "No available billing accounts"?</AccordionTrigger>
                          <AccordionContent className="text-sm space-y-3 text-muted-foreground">
                              <p>This happens when you are an owner of the <strong>Project</strong>, but you don't have permission to manage the <strong>Billing Account</strong> itself.</p>
                              <div className="space-y-2 border-l-2 border-primary/20 pl-4 py-2">
                                  <p className="font-semibold text-foreground">How to fix it (Do NOT go to Project IAM):</p>
                                  <ol className="list-decimal list-inside space-y-1">
                                      <li>Click the <strong>Hamburger Menu</strong> (top left) and select <strong>Billing</strong>.</li>
                                      <li><strong>CRITICAL:</strong> Click the specific <strong>name</strong> of your billing account from the list.</li>
                                      <li>Now that you are <em>inside</em> the account view, click on <strong>"Account Management"</strong> in the left sidebar.</li>
                                      <li>Look at the <strong>"Permissions"</strong> panel on the right side of the screen.</li>
                                      <li>Click <strong>"ADD PRINCIPAL"</strong>, enter your email address.</li>
                                      <li>In the <strong>"Role"</strong> box, select <strong>Billing &gt; Billing Account Administrator</strong>.</li>
                                      <li>Save, then you can go back to the "Projects" tab and link your project.</li>
                                  </ol>
                              </div>
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="billing-hang">
                          <AccordionTrigger className="text-sm font-semibold">Stuck on "Waiting for Billing Account"?</AccordionTrigger>
                          <AccordionContent className="text-sm space-y-3 text-muted-foreground">
                              <p>If the publisher is stuck even after you've paid, it's usually because the <strong>project</strong> isn't manually linked to your <strong>Billing Account</strong> yet.</p>
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
                      <AccordionItem value="dns-work">
                          <AccordionTrigger className="text-sm font-semibold">Does my project need to be published for DNS to work?</AccordionTrigger>
                          <AccordionContent className="text-sm space-y-3 text-muted-foreground">
                              <p><strong>Yes.</strong> While you can point your DNS records to Firebase at any time, your website will not actually "go live" until the Publisher process is complete.</p>
                              <ul className="list-disc list-inside space-y-1">
                                  <li><strong>DNS</strong> is just the map to your site.</li>
                                  <li><strong>Publishing</strong> is what puts your app code on the server.</li>
                                  <li><strong>SSL Security:</strong> Firebase cannot issue your security certificate until your project is successfully linked to billing.</li>
                              </ul>
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="billing-support">
                          <AccordionTrigger className="text-sm font-semibold">How to contact Billing Support?</AccordionTrigger>
                          <AccordionContent className="text-sm space-y-3 text-muted-foreground">
                              <div className="space-y-2">
                                  <ol className="list-decimal list-inside space-y-1">
                                      <li>Go to the <a href="https://console.cloud.google.com/billing" target="_blank" className="text-primary underline">Google Cloud Billing Console</a>.</li>
                                      <li>Click on the <strong>name</strong> of your billing account.</li>
                                      <li>Click on <strong>"Support"</strong> in the left-hand sidebar menu.</li>
                                      <li>Click the <strong>"Contact Support"</strong> button at the top of the page.</li>
                                  </ol>
                                  <p>Billing support is free for all accounts, even on the free tier.</p>
                              </div>
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="emails">
                          <AccordionTrigger className="text-sm font-semibold">Fixing "Sender Name" &amp; Verification</AccordionTrigger>
                          <AccordionContent className="text-sm space-y-3 text-muted-foreground">
                              <p>If Cloud won't let you change your "Public Name" due to verification, use this shortcut to fix your emails immediately:</p>
                              <ol className="list-decimal list-inside space-y-1">
                                  <li>Go to <strong>Auth &gt; Templates</strong> in Firebase.</li>
                                  <li>Edit any template (e.g., Email address change).</li>
                                  <li>In the <strong>Sender</strong> section, click the pencil.</li>
                                  <li>Update <strong>Display Name</strong> to "Affiliate AI Host".</li>
                              </ol>
                              <Button asChild variant="outline" size="sm" className="w-full mt-2">
                                  <Link href="https://console.firebase.google.com/project/_/authentication/emails" target="_blank">
                                      Open Auth Templates <ExternalLink className="ml-2 h-3 w-3" />
                                  </Link>
                              </Button>
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
                      <p>To protect your account, Firebase requires you to have logged in recently to perform this change. Please log out and log back in to continue.</p>
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
                        <div className="mt-4 p-3 bg-primary/10 rounded border border-primary/20 text-foreground">
                            <p className="font-semibold flex items-center gap-1 mb-1">
                                <ShieldCheck className="h-3 w-3" /> Admin Tip: Prevent Spam
                            </p>
                            <p>Go to your Firebase Console &gt; Auth &gt; Templates and <strong>customize your domain</strong>. This adds DKIM/SPF records which tells email providers your site is trusted.</p>
                        </div>
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

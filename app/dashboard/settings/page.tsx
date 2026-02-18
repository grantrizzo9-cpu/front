"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Loader2, PartyPopper, Mail, LogOut, CheckCircle2, ShieldCheck, Server } from "lucide-react";
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking, useMemoFirebase, useAuth } from "@/firebase";
import { doc, writeBatch } from "firebase/firestore";
import { verifyBeforeUpdateEmail, signOut } from "firebase/auth";
import type { User as UserType } from "@/lib/types";
import { useState, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAdmin } from "@/hooks/use-admin";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { isPlatformOwner } = useAdmin();
  const router = useRouter();

  const [isRepairing, setIsRepairing] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
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
  const { data: usernameDoc } = useDoc<{uid: string}>(usernameDocRef);

  const affiliateLink = userData?.username ? `https://hostproai.com/?ref=${userData.username.toLowerCase()}` : '';
  const isLinkActive = !!usernameDoc && usernameDoc.uid === user?.uid;

  const isGoogleUser = useMemo(() => {
      return user?.providerData.some(p => p.providerId === 'google.com');
  }, [user]);

  const handleCopyLink = () => {
    if (affiliateLink) {
      navigator.clipboard.writeText(affiliateLink);
      toast({ title: "Copied to Clipboard!", description: "Your affiliate link has been copied." });
    }
  };
  
  const handleBecomeAffiliate = () => {
      if (!userDocRef) return;
      updateDocumentNonBlocking(userDocRef, { isAffiliate: true });
      toast({ title: "Congratulations!", description: "You are now an affiliate. Your referral link is active." });
  }

  const handleRepairLink = async () => {
    if (!firestore || !user || !userData?.username || !userDocRef) return;
    setIsRepairing(true);
    try {
        const batch = writeBatch(firestore);
        const lowerCaseUsername = userData.username.toLowerCase();
        batch.update(userDocRef, { username: lowerCaseUsername });
        batch.set(doc(firestore, 'usernames', lowerCaseUsername), { uid: user.uid });
        await batch.commit();
        toast({ title: 'Success!', description: 'Your affiliate link has been repaired.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Repair Failed', description: error.message });
    } finally {
        setIsRepairing(false);
    }
  };

  const handleLogout = () => signOut(auth).then(() => router.push("/login"));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold font-headline heading-red">Settings</h1>
        <p className="text-muted-foreground">Manage your account and affiliate tools.</p>
      </div>

      {isPlatformOwner && (
          <Card className="border-primary/50 bg-primary/5">
              <CardHeader className="bg-primary/10 py-4"><CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Administrator Guide</CardTitle></CardHeader>
              <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="aws"><AccordionTrigger className="text-sm">AWS Amplify Hosting</AccordionTrigger><AccordionContent className="text-xs">Follow the README instructions to deploy the frontend to AWS while keeping this backend.</AccordionContent></AccordionItem>
                  </Accordion>
              </CardContent>
          </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Account Security</CardTitle><CardDescription>Update your email address.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {isUserDataLoading ? <Skeleton className="h-20 w-full" /> : isGoogleUser ? (
              <Alert className="bg-muted"><AlertTitle>Google Account Managed</AlertTitle><AlertDescription>Update your email via your Google Account settings.</AlertDescription></Alert>
          ) : (
              <div className="space-y-4">
                <div className="space-y-2"><Label>Current Email</Label><Input value={user?.email || ''} disabled className="bg-muted" /></div>
                <div className="space-y-2"><Label>New Email Address</Label><div className="flex gap-2"><Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@example.com" /><Button onClick={() => verifyBeforeUpdateEmail(user!, newEmail)}>Update</Button></div></div>
              </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Affiliate Dashboard</CardTitle></CardHeader>
        <CardContent>
          {isUserDataLoading ? <Skeleton className="h-24 w-full" /> : userData?.isAffiliate ? (
             <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg"><PartyPopper className="h-8 w-8 text-green-600" /><div><p className="font-semibold text-green-800">Affiliate account is active.</p><p className="text-sm text-green-700">Your referral link is ready.</p></div></div>
          ) : (
             <Button onClick={handleBecomeAffiliate}>Enable Affiliate Program</Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your Link</CardTitle></CardHeader>
        <CardContent>
          {isUserDataLoading ? <Skeleton className="h-10 w-full" /> : (
            <div className="flex items-center space-x-2">
              <Input value={affiliateLink} readOnly />
              <Button variant="outline" size="icon" onClick={handleCopyLink}><Copy className="h-4 w-4" /></Button>
            </div>
          )}
          {!isUserDataLoading && userData?.isAffiliate && !isLinkActive && (
            <Button onClick={handleRepairLink} className="mt-4 w-full" disabled={isRepairing}>{isRepairing ? <Loader2 className="animate-spin" /> : "Repair Inactive Link"}</Button>
          )}
        </CardContent>
      </Card>
      
      <div className="pt-4"><Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto"><LogOut className="mr-2 h-4 w-4" /> Sign Out</Button></div>
    </div>
  );
}

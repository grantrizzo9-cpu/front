"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Loader2 } from "lucide-react";
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { User as UserType } from "@/lib/types";

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  const affiliateLink = userData ? `https://affiliateai.host/?ref=${userData.username}` : '';
  
  const handleCopyLink = () => {
    if (affiliateLink) {
      navigator.clipboard.writeText(affiliateLink);
      toast({
        title: "Copied to Clipboard!",
        description: "Your affiliate link has been copied.",
      });
    }
  };
  
  const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userDocRef) return;
    
    const formData = new FormData(e.currentTarget);
    const newPaypalEmail = formData.get('paypal-email') as string;

    updateDocumentNonBlocking(userDocRef, { paypalEmail: newPaypalEmail });
    
    toast({
      title: "Changes Saved",
      description: "Your PayPal email has been updated.",
    });
  };

  const isLoading = isUserLoading || isUserDataLoading;

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
          <CardTitle>Your Affiliate Link</CardTitle>
          <CardDescription>Share this link to refer new users and earn commissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input type="text" value={affiliateLink} readOnly />
            <Button variant="outline" size="icon" onClick={handleCopyLink} disabled={!affiliateLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <form onSubmit={handleSaveChanges}>
          <CardHeader>
            <CardTitle>Payout Information</CardTitle>
            <CardDescription>This is the PayPal email where your daily commissions will be sent.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="paypal-email">PayPal Email</Label>
              <Input id="paypal-email" name="paypal-email" type="email" defaultValue={userData?.paypalEmail || ''} required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

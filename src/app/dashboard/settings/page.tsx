"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

export default function SettingsPage() {
  // This would come from the logged-in user's data
  const username = "affiliate-user";
  const affiliateLink = `https://affiliateai.host/?ref=${username}`;
  const paypalEmail = "user@example.com";

  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast({
      title: "Copied to Clipboard!",
      description: "Your affiliate link has been copied.",
    });
  };
  
  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Changes Saved",
      description: "Your settings have been updated.",
    });
  };

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
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
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
              <Input id="paypal-email" type="email" defaultValue={paypalEmail} required />
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

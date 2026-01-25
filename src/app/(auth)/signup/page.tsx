"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { subscriptionTiers } from "@/lib/data";
import { useEffect, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const planId = searchParams.get("plan");
    const refCode = searchParams.get("ref");
    if (planId) {
        const plan = subscriptionTiers.find(p => p.id === planId);
        if (plan) {
            setSelectedPlan(plan.name);
        }
    }
    if (refCode) {
        setReferralCode(refCode);
    }
  }, [searchParams]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Here you would:
    // 1. Create user in Firebase Auth
    // 2. Create user document in Firestore, saving `referralCode`
    // 3. Trigger a (simulated) PayPal payment for the `planId`
    // 4. On success, activate subscription and credit referrer
    // 5. Redirect to dashboard
    
    toast({
      title: "Account Created!",
      description: "Simulating payment and redirecting to your dashboard...",
    });
    router.push("/dashboard");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Create Your Account</CardTitle>
        <CardDescription>
            {selectedPlan 
                ? `You've selected the ${selectedPlan} plan. Let's get you set up.`
                : "Join now to become an affiliate and start earning."
            }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" placeholder="your-username" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          {referralCode && (
             <div className="text-sm text-muted-foreground p-3 bg-secondary rounded-md">
                You were referred by: <span className="font-semibold text-foreground">{referralCode}</span>
             </div>
          )}
          <Button type="submit" className="w-full">
            {selectedPlan ? `Sign Up & Pay with PayPal` : `Create Account`}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

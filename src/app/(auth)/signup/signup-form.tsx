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
import { Loader2, Users } from "lucide-react";
import { useAuth, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp } from "firebase/firestore";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const planIdParam = searchParams.get("plan");
    const refCode = searchParams.get("ref");
    if (planIdParam) {
        const plan = subscriptionTiers.find(p => p.id === planIdParam);
        if (plan) {
            setSelectedPlan(plan.name);
            setPlanId(plan.id);
        }
    }
    if (refCode) {
        setReferralCode(refCode);
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update user profile with username
        await updateProfile(user, { displayName: username });

        // 3. Create user document in Firestore
        const userDocRef = doc(firestore, "users", user.uid);
        const userData = {
            id: user.uid, // FIX: Use `id` to match security rules
            email: user.email,
            username: username,
            referredBy: referralCode || null,
            isAffiliate: true, // All signups are affiliates
            createdAt: serverTimestamp(), // Use server timestamp for consistency
            subscription: planId ? {
                tierId: planId,
                status: 'active', // Simulate active subscription
                startDate: serverTimestamp(),
                endDate: null
            } : null,
            paypalEmail: '' // User needs to set this in settings
        };
        
        // This non-blocking call will now succeed with the corrected data.
        setDocumentNonBlocking(userDocRef, userData, { merge: false });

        toast({
          title: "Account Created!",
          description: "Redirecting to your dashboard...",
        });
        router.push("/dashboard");

    } catch (error: any) {
        console.error("Signup failed:", error);
        let description = error.message || "An unknown error occurred while creating your account.";
        if (error.code === 'auth/email-already-in-use') {
            description = "This email address is already in use. Please log in or use a different email.";
        } else if (error.code === 'auth/weak-password') {
            description = "The password is too weak. Please use at least 6 characters.";
        }
        toast({
            variant: "destructive",
            title: "Signup Failed",
            description: description,
        });
    } finally {
        setIsLoading(false);
    }
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
            <Input id="username" name="username" type="text" placeholder="your-username" required disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required disabled={isLoading} />
          </div>
          {referralCode && (
             <div className="flex items-center gap-3 text-sm text-primary border border-primary/20 bg-primary/5 p-3 rounded-lg">
                <Users className="h-5 w-5 flex-shrink-0" />
                <span>
                    You were referred by: <span className="font-semibold">{referralCode}</span>
                </span>
             </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
                <Loader2 className="animate-spin" />
            ) : selectedPlan ? (
                `Sign Up & Start Earning`
            ) : (
                `Create Account`
            )}
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

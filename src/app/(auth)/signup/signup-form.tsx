
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
import { doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

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
        const referrerUsername: string | null = referralCode || null;

        // 1. Create user in Firebase Auth. This is the only operation we wait for.
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Immediately toast and redirect for a snappy user experience.
        toast({
          title: "Account Created!",
          description: "Setting up your account and redirecting...",
        });
        router.push("/dashboard");

        // 3. Prepare user data and run all subsequent database operations
        // in the background without blocking the UI.
        const userDocRef = doc(firestore, "users", user.uid);
        const plan = planId ? subscriptionTiers.find(p => p.id === planId) : null;
        
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 3);

        const userData = {
            id: user.uid,
            email: user.email,
            username: username,
            referredBy: referrerUsername,
            isAffiliate: true,
            createdAt: serverTimestamp(),
            subscription: plan ? {
                tierId: plan.id,
                status: 'active' as const,
                startDate: serverTimestamp(),
                endDate: null,
                trialEndDate: Timestamp.fromDate(trialEndDate),
            } : null,
            paypalEmail: '',
            customDomain: null
        };
        
        const usernameDocRef = doc(firestore, "usernames", username);

        // These non-blocking operations run in the background. The user is already on their way to the dashboard.
        updateProfile(user, { displayName: username }).catch(e => console.error("Failed to update auth profile:", e));
        setDocumentNonBlocking(userDocRef, userData, {});
        setDocumentNonBlocking(usernameDocRef, { uid: user.uid }, {});

    } catch (error: any) {
        let description;
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                description = "This email address is already in use. Please log in or use a different email.";
                break;
            case 'auth/weak-password':
                description = "The password is too weak. Please use at least 6 characters.";
                break;
            case 'auth/configuration-not-found':
            case 'auth/api-key-not-valid':
              description = `The API Key being used starts with: ${firebaseConfig.apiKey.substring(0,12)}... but is being rejected. This is usually due to a Google Cloud project issue. Please ensure: 1) The user '${email}' has the 'Owner' role on the project's IAM page. 2) The project is linked to an active billing account.`;
              break;
            default:
                description = error.message || "An unknown error occurred while creating your account.";
        }

        toast({
            variant: "destructive",
            title: "Signup Failed",
            description: description,
        });
    } finally {
        // We set isLoading to false immediately in the catch block, but if successful,
        // the user will have navigated away, so this won't be visible.
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

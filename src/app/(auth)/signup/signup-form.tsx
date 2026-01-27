
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
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc, getDoc, collection, addDoc, Timestamp } from "firebase/firestore";

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
    if (!firestore) {
      toast({ variant: "destructive", title: "Signup Failed", description: "Database service is not available." });
      return;
    }
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

        let referrerId: string | null = null;
        let referrerUsername: string | null = referralCode || null;

        // 3. Find referrer if one exists
        if (referrerUsername) {
            const referrerUsernameRef = doc(firestore, "usernames", referrerUsername);
            const referrerUsernameSnap = await getDoc(referrerUsernameRef);
            if (referrerUsernameSnap.exists()) {
                referrerId = referrerUsernameSnap.data().uid;
            } else {
                console.warn(`Referrer with username "${referrerUsername}" not found.`);
            }
        }

        // 4. Create user document in Firestore. THIS MUST HAPPEN BEFORE CREATING THE REFERRAL.
        const userDocRef = doc(firestore, "users", user.uid);
        const plan = planId ? subscriptionTiers.find(p => p.id === planId) : null;
        
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 3);

        const userData = {
            id: user.uid,
            email: user.email,
            username: username,
            referredBy: referrerId, // Store referrer's UID
            isAffiliate: true,
            createdAt: serverTimestamp(),
            subscription: plan ? {
                tierId: plan.id,
                status: 'active',
                startDate: serverTimestamp(),
                endDate: null,
                trialEndDate: Timestamp.fromDate(trialEndDate),
            } : null,
            paypalEmail: '',
            customDomain: null
        };
        await setDoc(userDocRef, userData);

        // 5. Create the public username-to-UID mapping for the new user. THIS MUST HAPPEN BEFORE OTHER USERS CAN REFER.
        const usernameDocRef = doc(firestore, "usernames", username);
        await setDoc(usernameDocRef, { uid: user.uid });

        // 6. If referral is valid, create ONE referral doc for the referrer
        if (referrerId && plan) {
            const referralRef = collection(firestore, 'users', referrerId, 'referrals');
            const commissionAmount = plan.price * 0.70;
            const newReferralData = {
                affiliateId: referrerId,
                referredUserId: user.uid,
                referredUserUsername: username,
                planPurchased: plan.name,
                commission: commissionAmount,
                status: 'unpaid' as 'unpaid',
                date: serverTimestamp(),
                subscriptionId: "simulated_sub_id_" + user.uid,
                // This property is added specifically for the security rule check
                triggeringUserReferredBy: referrerId,
            };
            // This write is now secured by a simpler, more robust security rule.
            await addDoc(referralRef, newReferralData);
        }

        toast({
          title: "Account Created!",
          description: "Redirecting to your dashboard...",
        });
        router.push("/dashboard");

    } catch (error: any) {
        let description = "An unknown error occurred while creating your account.";
        if (error.code === 'auth/email-already-in-use') {
            description = "This email address is already in use. Please log in or use a different email.";
        } else if (error.code === 'auth/weak-password') {
            description = "The password is too weak. Please use at least 6 characters.";
        } else if (error.code === 'permission-denied') {
            description = "A security rule prevented signup. This might be due to an invalid referral code or system misconfiguration."
        } else if (error.message) {
            description = error.message;
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

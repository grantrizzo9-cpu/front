
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, writeBatch, serverTimestamp, collection } from "firebase/firestore";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { subscriptionTiers } from "@/lib/data";

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 fill-current"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.98-4.48 1.98-3.62 0-6.55-2.92-6.55-6.55s2.93-6.55 6.55-6.55c2.03 0 3.33.82 4.1 1.59l2.48-2.48C17.22 3.43 15.14 2 12.48 2 7.08 2 3 6.08 3 11.48s4.08 9.48 9.48 9.48c5.13 0 9.1-3.48 9.1-9.28 0-.6-.08-1.12-.2-1.68H3.48v.01z"></path></svg>
);


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
      router.push("/dashboard");
    } catch (error: any) {
      let description = "An unknown error occurred. Please try again.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        description = "Invalid email or password. If you've signed up before, you can also reset your password.";
      } else if (error.code === 'auth/too-many-requests') {
        description = "Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.";
      } else if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/configuration-not-found') {
          description = "The Firebase configuration is invalid. Please check your API key."
      } else if (error.message) {
        description = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: description,
      });
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        const planId = searchParams.get("plan") || 'starter';
        const plan = subscriptionTiers.find(p => p.id === planId) || subscriptionTiers[0];
        const referralCode = searchParams.get("ref");


        if (!userDoc.exists()) {
            const batch = writeBatch(firestore);
            
            // Create a unique, lowercase username
            let finalUsername = (user.displayName || user.email?.split('@')[0] || `user${user.uid.substring(0,5)}`).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const usernameDocRef = doc(firestore, "usernames", finalUsername);
            const usernameDoc = await getDoc(usernameDocRef);
            if (usernameDoc.exists()) {
                finalUsername = `${finalUsername}${Math.floor(100 + Math.random() * 900)}`;
            }
            batch.set(doc(firestore, "usernames", finalUsername), { uid: user.uid });

            let referrerUid: string | null = null;
            if (referralCode) {
                const referrerUsernameDoc = await getDoc(doc(firestore, "usernames", referralCode.toLowerCase()));
                if (referrerUsernameDoc.exists()) {
                    referrerUid = referrerUsernameDoc.data().uid;
                }
            }
            
            const newUserDocData = {
                id: user.uid,
                email: user.email,
                username: finalUsername,
                referredBy: referrerUid, // Correctly set the referrer's UID
                isAffiliate: true,
                createdAt: serverTimestamp(),
                subscription: {
                    tierId: plan.id,
                    status: 'inactive' as const,
                    startDate: serverTimestamp(),
                    endDate: null,
                },
                paypalEmail: '',
                customDomain: null
            };
            batch.set(userDocRef, newUserDocData);

             // If there was a referrer, create the referral document in their subcollection
            if (referrerUid) {
                const referralDocRef = doc(collection(firestore, 'users', referrerUid, 'referrals'), user.uid);
                const referralData = {
                    id: user.uid,
                    affiliateId: referrerUid,
                    referredUserId: user.uid,
                    referredUserUsername: finalUsername,
                    referredUserEmail: user.email || '',
                    planPurchased: plan.name,
                    grossSale: 0,
                    commission: 0,
                    status: 'paid' as const, // 'paid' because commission is 0
                    activationStatus: 'pending' as const,
                    date: serverTimestamp(),
                    subscriptionId: user.uid, // Using user's UID as a unique ID for this
                };
                batch.set(referralDocRef, referralData);
            }

            await batch.commit();
             toast({
                title: "Account Created!",
                description: "Welcome! Let's get your plan activated.",
            });
            router.push(planId ? `/dashboard/upgrade?plan=${planId}` : "/dashboard/upgrade");
        } else {
             toast({
                title: "Login Successful",
                description: "Welcome back!",
            });
            router.push("/dashboard");
        }

    } catch (error: any) {
        let description = "An unknown error occurred. Please try again.";
        if (error.code === 'auth/popup-closed-by-user') {
            description = "The sign-in window was closed before completion.";
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            description = "An account already exists with the same email address but different sign-in credentials. Please sign in using the original method.";
        }
        toast({
            variant: "destructive",
            title: "Google Sign-In Failed",
            description: description,
        });
    } finally {
        setIsGoogleLoading(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Access Your Account</CardTitle>
        <CardDescription>Log in or create an account to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required disabled={isLoading || isGoogleLoading} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
                Forgot password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required disabled={isLoading || isGoogleLoading}/>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Log In"}
          </Button>
        </form>
         <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
            {isGoogleLoading ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
            Sign In with Google
        </Button>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

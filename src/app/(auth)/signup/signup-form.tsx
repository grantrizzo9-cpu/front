
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
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, writeBatch, serverTimestamp, Timestamp, collection } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";
import { PayPalPaymentButton } from "@/components/paypal-payment-button";

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 fill-current"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.98-4.48 1.98-3.62 0-6.55-2.92-6.55-6.55s2.93-6.55 6.55-6.55c2.03 0 3.33.82 4.1 1.59l2.48-2.48C17.22 3.43 15.14 2 12.48 2 7.08 2 3 6.08 3 11.48s4.08 9.48 9.48 9.48c5.13 0 9.1-3.48 9.1-9.28 0-.6-.08-1.12-.2-1.68H3.48v.01z"></path></svg>
);


export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const [selectedPlanName, setSelectedPlanName] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const planId = searchParams.get("plan");
  const referralCode = searchParams.get("ref");
  
  const isFormValid = username.length > 2 && email.includes('@') && password.length >= 6;

  useEffect(() => {
    if (planId) {
        const plan = subscriptionTiers.find(p => p.id === planId);
        if (plan) {
            setSelectedPlanName(plan.name);
        }
    } else {
        // If no plan is selected, redirect to pricing page.
        // This is crucial because payment is now part of signup.
        toast({
            title: "No Plan Selected",
            description: "Please choose a plan to continue.",
            variant: "destructive"
        });
        router.push(referralCode ? `/pricing?ref=${referralCode}` : '/pricing');
    }
  }, [planId, router, referralCode, toast]);

  const handlePaymentSuccess = async (paymentDetails: any) => {
    // This function now contains all the logic for creating a user
    // after a successful payment.
    try {
        const plan = planId ? subscriptionTiers.find(p => p.id === planId) : null;
        if (!plan) {
            // This should ideally not happen if the effect above works correctly.
            toast({ variant: "destructive", title: "Signup Failed", description: "No plan was selected." });
            setIsProcessing(false);
            return;
        }

        // Check if username is already taken before creating the user
        const usernameDocRef = doc(firestore, "usernames", username);
        const usernameDoc = await getDoc(usernameDocRef);
        if (usernameDoc.exists()) {
            toast({ variant: "destructive", title: "Username Taken", description: "This username is already in use. Please choose another one." });
            setIsProcessing(false);
            return;
        }

        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: username });

        // 2. Prepare all database writes in a batch
        const batch = writeBatch(firestore);

        const userDocRef = doc(firestore, "users", user.uid);
        
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 3);

        const userData = {
            id: user.uid,
            email: user.email,
            username: username,
            referredBy: referralCode || null,
            isAffiliate: true,
            createdAt: serverTimestamp(),
            subscription: {
                tierId: plan.id,
                status: 'active' as const,
                startDate: serverTimestamp(),
                endDate: null,
                trialEndDate: Timestamp.fromDate(trialEndDate),
            },
            paypalEmail: '',
            customDomain: null
        };
        batch.set(userDocRef, userData);

        batch.set(usernameDocRef, { uid: user.uid });

        if (referralCode) {
            const referrerUsernameDocRef = doc(firestore, "usernames", referralCode);
            const referrerUsernameDoc = await getDoc(referrerUsernameDocRef);
            if (referrerUsernameDoc.exists()) {
                const referrerId = referrerUsernameDoc.data().uid;
                
                const commissionRate = 0.70;
                const commissionAmount = plan.price * commissionRate;

                const newReferralRef = doc(collection(firestore, 'users', referrerId, 'referrals'));
                
                batch.set(newReferralRef, {
                    id: newReferralRef.id,
                    affiliateId: referrerId,
                    referredUserId: user.uid,
                    referredUserUsername: username,
                    planPurchased: plan.name,
                    grossSale: plan.price,
                    commission: commissionAmount,
                    status: 'unpaid' as const,
                    date: serverTimestamp(),
                    subscriptionId: user.uid,
                });
            }
        }

        await batch.commit();

        toast({
          title: "Account Created!",
          description: "Welcome! We're redirecting you to your dashboard.",
        });
        router.push("/dashboard");

    } catch (error: any) {
        let description;
        switch (error.code) {
            case 'auth/email-already-in-use': description = "This email address is already in use. Please log in or use a different email."; break;
            case 'auth/weak-password': description = "The password is too weak. Please use at least 6 characters."; break;
            case 'auth/configuration-not-found':
            case 'auth/api-key-not-valid': description = `The application is trying to connect to Firebase project '${firebaseConfig.projectId}', but the configuration is invalid. This is often because the project is missing an active billing account or the correct IAM permissions in Google Cloud. Please double-check your project settings.`; break;
            default: description = error.message || "An unknown error occurred while creating your account.";
        }
        toast({ variant: "destructive", title: "Signup Failed", description: description });
        setIsProcessing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    // This flow remains unchanged. Google sign-in provides a trial.
    // The user can upgrade with PayPal from the dashboard.
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            const plan = planId ? subscriptionTiers.find(p => p.id === planId) : null;
            const batch = writeBatch(firestore);
            
            let username = (user.displayName || user.email?.split('@')[0] || `user${user.uid.substring(0,5)}`).replace(/[^a-zA-Z0-9]/g, '');
            const initialUsernameDocRef = doc(firestore, "usernames", username);
            const initialUsernameDoc = await getDoc(initialUsernameDocRef);
            if (initialUsernameDoc.exists()) {
                username = `${username}${Math.floor(100 + Math.random() * 900)}`;
            }
            batch.set(doc(firestore, "usernames", username), { uid: user.uid });
            if (user.displayName !== username) {
                await updateProfile(user, { displayName: username });
            }

            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 3);

            const newUserDocData = {
                id: user.uid, email: user.email, username: username, referredBy: referralCode, isAffiliate: true, createdAt: serverTimestamp(),
                subscription: plan ? {
                    tierId: plan.id, status: 'active' as const, startDate: serverTimestamp(), endDate: null, trialEndDate: Timestamp.fromDate(trialEndDate),
                } : null,
                paypalEmail: '', customDomain: null
            };
            batch.set(userDocRef, newUserDocData);
            
            if (referralCode && plan) {
                const referrerUsernameDocRef = doc(firestore, "usernames", referralCode);
                const referrerUsernameDoc = await getDoc(referrerUsernameDocRef);
                if (referrerUsernameDoc.exists()) {
                    const referrerId = referrerUsernameDoc.data().uid;
                    const commissionAmount = plan.price * 0.70;
                    const newReferralRef = doc(collection(firestore, 'users', referrerId, 'referrals'));
                    batch.set(newReferralRef, {
                        id: newReferralRef.id, affiliateId: referrerId, referredUserId: user.uid, referredUserUsername: username,
                        planPurchased: plan.name, grossSale: plan.price, commission: commissionAmount, status: 'unpaid' as const,
                        date: serverTimestamp(), subscriptionId: user.uid,
                    });
                }
            }

            await batch.commit();
            toast({ title: "Account Created!", description: "Welcome! We've set up your new account." });
        } else {
             toast({ title: "Login Successful", description: "Welcome back!" });
        }
        router.push("/dashboard");

    } catch (error: any) {
        let description = "An unknown error occurred. Please try again.";
        if (error.code === 'auth/popup-closed-by-user') {
            description = "The sign-in window was closed before completion.";
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            description = "An account already exists with the same email address but different sign-in credentials. Please sign in using the original method.";
        }
        toast({ variant: "destructive", title: "Google Sign-In Failed", description: description });
    } finally {
        setIsGoogleLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Create Your Account</CardTitle>
        <CardDescription>
            {selectedPlanName 
                ? `You've selected the ${selectedPlanName} plan. Complete the form and pay with PayPal to start.`
                : "Join now to become an affiliate and start earning."
            }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" type="text" placeholder="your-username" required disabled={isProcessing || isGoogleLoading} value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required disabled={isProcessing || isGoogleLoading} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password (min. 6 characters)</Label>
            <Input id="password" name="password" type="password" required disabled={isProcessing || isGoogleLoading} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {referralCode && (
             <div className="flex items-center gap-3 text-sm text-primary border border-primary/20 bg-primary/5 p-3 rounded-lg">
                <Users className="h-5 w-5 flex-shrink-0" />
                <span>
                    You were referred by: <span className="font-semibold">{referralCode}</span>
                </span>
             </div>
          )}
          
          {planId && (
            <div className="relative pt-4">
               {isProcessing && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 rounded-md">
                      <Loader2 className="animate-spin h-8 w-8 text-primary" />
                      <p className="mt-2 text-sm text-muted-foreground">Processing... Do not close this window.</p>
                  </div>
               )}
               <PayPalPaymentButton 
                    planId={planId}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentStart={() => setIsProcessing(true)}
                    onPaymentError={() => setIsProcessing(false)}
                    disabled={!isFormValid || isProcessing || isGoogleLoading}
               />
            </div>
          )}
        </div>
         <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
            </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isProcessing || isGoogleLoading}>
            {isGoogleLoading ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
            Sign Up with Google
        </Button>
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

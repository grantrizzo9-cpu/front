
'use client';

import { useState, Suspense, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { subscriptionTiers } from "@/lib/data";
import { Loader2, Users } from "lucide-react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { doc, getDoc, writeBatch, serverTimestamp, setDoc, collection } from "firebase/firestore";
import { Skeleton } from '@/components/ui/skeleton';


const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 fill-current"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.98-4.48 1.98-3.62 0-6.55-2.92-6.55-6.55s2.93-6.55 6.55-6.55c2.03 0 3.33.82 4.1 1.59l2.48-2.48C17.22 3.43 15.14 2 12.48 2 7.08 2 3 6.08 3 11.48s4.08 9.48 9.48 9.48c5.13 0 9.1-3.48 9.1-9.28 0-.6-.08-1.12-.2-1.68H3.48v.01z"></path></svg>
);


function SignupFormComponent() {
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();
    const searchParams = useSearchParams();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState({ username: '', email: '', password: '' });
    
    const planId = searchParams.get("plan") || 'starter';
    const referralCode = searchParams.get("ref");
    const plan = subscriptionTiers.find(p => p.id === planId) || subscriptionTiers[0];

    useEffect(() => {
        const newErrors = { username: '', email: '', password: '' };
        if (username.length > 0 && username.length <= 2) {
            newErrors.username = "Username must be longer than 2 characters.";
        }
        if (password.length > 0 && password.length < 6) {
            newErrors.password = "Password must be at least 6 characters.";
        }
        if (email.length > 0 && !/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = "Please enter a valid email address.";
        }
        setErrors(newErrors);
    }, [username, email, password]);
    
    const isFormValid = username.length > 2 && /^\S+@\S+\.\S+$/.test(email) && password.length >= 6;

    const postSignupFlow = async (user: User, finalUsername: string) => {
        const batch = writeBatch(firestore);
        const userDocRef = doc(firestore, "users", user.uid);
        
        let referrerUid: string | null = null;
        if (referralCode) {
            const referrerUsernameDoc = await getDoc(doc(firestore, "usernames", referralCode.toLowerCase()));
            if (referrerUsernameDoc.exists()) {
                // Use optional chaining for safety, although uid should always exist.
                referrerUid = referrerUsernameDoc.data()?.uid ?? null;
            }
        }

        const userData = {
            id: user.uid, email: user.email, username: finalUsername, referredBy: referrerUid, isAffiliate: true, createdAt: serverTimestamp(),
            subscription: {
                tierId: plan.id,
                status: 'inactive' as const,
                startDate: serverTimestamp(),
                endDate: null,
            },
            paypalEmail: '', customDomain: null
        };
        batch.set(userDocRef, userData);

        const usernameDocForWriteRef = doc(firestore, "usernames", finalUsername);
        batch.set(usernameDocForWriteRef, { uid: user.uid });

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

        toast({ title: "Account Created!", description: "Welcome! We're redirecting you to activate your plan." });
        router.push(`/dashboard/upgrade?plan=${plan.id}`);
    };

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsProcessing(true);
        
        const finalUsername = username.toLowerCase();

        try {
            const usernameDocRef = doc(firestore, "usernames", finalUsername);
            const usernameDoc = await getDoc(usernameDocRef);
            if (usernameDoc.exists()) {
                toast({ variant: "destructive", title: "Username Taken", description: "This username is already in use. Please choose another one." });
                setIsProcessing(false);
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: finalUsername });
            await postSignupFlow(userCredential.user, finalUsername);

        } catch (error: any) {
            let description;
            switch (error.code) {
                case 'auth/email-already-in-use': description = "This email address is already in use by another account."; break;
                case 'auth/weak-password': description = "The password is too weak. Please use at least 6 characters."; break;
                default: description = error.message || "An unknown error occurred while creating your account.";
            }
            toast({ variant: "destructive", title: "Account Creation Failed", description: description });
            setIsProcessing(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setIsProcessing(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userDocRef = doc(firestore, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                let g_username = (user.displayName || user.email?.split('@')[0] || `user${user.uid.substring(0,5)}`).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                const initialUsernameDoc = await getDoc(doc(firestore, "usernames", g_username));
                if (initialUsernameDoc.exists()) g_username = `${g_username}${Math.floor(100 + Math.random() * 900)}`;
                
                await postSignupFlow(user, g_username);
            } else {
                 toast({ title: "Login Successful", description: "Welcome back!" });
                 router.push("/dashboard");
            }
        } catch (error: any) {
             toast({ variant: "destructive", title: "Google Sign-In Failed", description: error.message });
             setIsProcessing(false);
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Create Your Account</CardTitle>
                <CardDescription>
                    You're creating an account for the <strong>{plan.name}</strong> plan. On the next step, you'll pay a one-time activation fee to start your 3-day trial.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleSignup}>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isProcessing} />
                        {errors.username && <p className="text-sm text-destructive mt-1">{errors.username}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isProcessing} />
                        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password (min. 6 characters)</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isProcessing} />
                        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                    </div>
                    {referralCode && (
                        <div className="flex items-center gap-3 text-sm text-primary border border-primary/20 bg-primary/5 p-3 rounded-lg">
                            <Users className="h-5 w-5 flex-shrink-0" />
                            <span>You were referred by: <span className="font-semibold">{referralCode}</span></span>
                        </div>
                    )}
                    <Button type="submit" className="w-full" disabled={!isFormValid || isProcessing}>
                        {isProcessing ? <Loader2 className="animate-spin" /> : "Create Account & Proceed to Payment"}
                    </Button>
                </form>
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
                </div>
                 <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
                    Sign Up with Google
                </Button>
            </CardContent>
            <CardFooter>
                 <div className="mt-4 text-center text-sm w-full">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">Log in</Link>
                </div>
            </CardFooter>
        </Card>
    );
}

function SignupLoadingSkeleton() {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
}
  
export default function SignupPage() {
    return (
        <Suspense fallback={<SignupLoadingSkeleton />}>
            <SignupFormComponent />
        </Suspense>
    );
}

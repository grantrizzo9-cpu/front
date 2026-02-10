'use client';

import { useState, Suspense, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { subscriptionTiers } from "@/lib/data";
import { Loader2, Users, RefreshCcw, ShieldAlert, CheckCircle2, ExternalLink } from "lucide-react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile, User } from "firebase/auth";
import { doc, getDoc, writeBatch, serverTimestamp, collection, terminate, clearIndexedDbPersistence, enableNetwork } from "firebase/firestore";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { firebaseConfig } from "@/firebase/config";

function SignupFormComponent() {
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState({ username: '', email: '', password: '' });
    const [isOffline, setIsOffline] = useState(false);
    const [currentHostname, setCurrentHostname] = useState("");

    const [planId, setPlanId] = useState('starter');
    const [referralCode, setReferralCode] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const plan = params.get('plan');
        const ref = params.get('ref');
        if (plan) setPlanId(plan);
        if (ref) setReferralCode(ref);
        setCurrentHostname(window.location.hostname);
    }, []);
    
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

    const handleHardReset = async () => {
        setIsProcessing(true);
        try {
            if (firestore) {
                await terminate(firestore);
                await clearIndexedDbPersistence(firestore);
            }
            toast({ title: "Cache Cleared", description: "Reloading Signup..." });
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (e) {
            window.location.reload();
        }
    };

    const postSignupFlow = async (user: User, finalUsername: string, refCode: string | null) => {
        // Attempt to enable network before batch commit
        try { await enableNetwork(firestore); } catch (e) {}

        const batch = writeBatch(firestore);
        const userDocRef = doc(firestore, "users", user.uid);
        
        let referrerUid: string | null = null;
        if (refCode) {
            try {
                const referrerUsernameDoc = await getDoc(doc(firestore, "usernames", refCode.toLowerCase()));
                if (referrerUsernameDoc.exists()) {
                    referrerUid = referrerUsernameDoc.data()?.uid ?? null;
                }
            } catch (e) {}
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
                status: 'unpaid' as const,
                activationStatus: 'pending' as const,
                date: serverTimestamp(),
                subscriptionId: user.uid,
            };
            batch.set(referralDocRef, referralData);
        }

        // AUTO-RETRY LOGIC for Batch Commit
        let retries = 3;
        while (retries > 0) {
            try {
                await batch.commit();
                toast({ title: "Account Created!", description: "Welcome to Affiliate AI Host!" });
                router.push(`/dashboard/upgrade?plan=${plan.id}`);
                return;
            } catch (err: any) {
                console.warn(`Batch commit failed, retrying... (${retries} left)`, err.message);
                retries--;
                if (retries === 0) throw err;
                await new Promise(r => setTimeout(r, 2000)); // Wait 2s before retry
            }
        }
    };

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsProcessing(true);
        setIsOffline(false);
        
        const finalUsername = username.toLowerCase().trim();

        try {
            // Direct attempt to check username
            const usernameDocRef = doc(firestore, "usernames", finalUsername);
            try {
                const usernameDoc = await getDoc(usernameDocRef);
                if (usernameDoc.exists()) {
                    toast({ variant: "destructive", title: "Username Taken", description: "This username is already in use." });
                    setIsProcessing(false);
                    return;
                }
            } catch (err: any) {
                // Ignore pre-check failures, the batch commit will catch duplicates
                console.warn("Username pre-check skipped due to connection warm-up.");
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: finalUsername });
            await postSignupFlow(userCredential.user, finalUsername, referralCode);

        } catch (error: any) {
            console.error("Signup error:", error.code, error.message);
            
            const isConnectionIssue = 
                error.message?.toLowerCase().includes('referer-blocked') || 
                error.code === 'auth/requests-from-referer-blocked' ||
                error.message?.toLowerCase().includes('offline') ||
                error.code === 'unavailable';

            if (isConnectionIssue) {
                setIsOffline(true);
                setIsProcessing(false);
                return;
            }

            let errorMessage = error.message;
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already registered. Please log in.";
            }

            toast({ variant: "destructive", title: "Signup Failed", description: errorMessage });
            setIsProcessing(false);
        }
    };

    const gcpCredentialsUrl = `https://console.cloud.google.com/apis/credentials?project=${firebaseConfig.projectId}`;
    
    return (
        <div className="space-y-6">
            {isOffline && (
                <Alert variant="destructive" className="border-amber-500 bg-amber-50 shadow-lg">
                    <ShieldAlert className="h-5 w-5 text-amber-600" />
                    <AlertTitle className="font-bold text-red-800">Domain Whitelist Required</AlertTitle>
                    <AlertDescription className="text-sm space-y-3 text-red-700">
                        <p>Since you are visiting from your custom domain, you must add it to your Google Cloud API Key whitelist.</p>
                        
                        <div className="bg-white/80 p-3 rounded border border-amber-200 space-y-2">
                            <p className="font-bold text-xs uppercase tracking-tighter flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600"/> Add this entry to GCP:</p>
                            <code className="block p-2 bg-slate-900 text-green-400 rounded font-mono text-xs break-all">
                                https://{currentHostname}/*
                            </code>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button onClick={handleHardReset} variant="default" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                                1. Clear Cache & Refresh
                            </Button>
                            <Button asChild variant="outline" size="sm" className="bg-white text-amber-800 border-amber-200 font-bold">
                                <a href={gcpCredentialsUrl} target="_blank" rel="noopener noreferrer">
                                    2. Open Google Cloud Settings <ExternalLink className="ml-2 h-3 w-3" />
                                </a>
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-red-600">Create Your Account</CardTitle>
                    <CardDescription>
                        Register your unique affiliate username to get started.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSignup}>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isProcessing} placeholder="Choose a unique username" />
                            {errors.username && <p className="text-sm text-destructive mt-1">{errors.username}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isProcessing} placeholder="you@example.com" />
                            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isProcessing} placeholder="Min. 6 characters" />
                            {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                        </div>
                        {referralCode && (
                            <div className="flex items-center gap-3 text-sm text-primary border border-primary/20 bg-primary/5 p-3 rounded-lg">
                                <Users className="h-5 w-5 flex-shrink-0" />
                                <span>You were referred by: <span className="font-semibold">{referralCode}</span></span>
                            </div>
                        )}
                        <Button type="submit" className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg" disabled={!isFormValid || isProcessing}>
                            {isProcessing ? <Loader2 className="animate-spin" /> : "Create Account & Proceed"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="text-center text-sm w-full">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline font-bold">Log in</Link>
                    </div>
                    <Button onClick={handleHardReset} variant="ghost" size="sm" className="text-muted-foreground text-xs">
                        <RefreshCcw className="mr-2 h-3 w-3" /> Still saying "offline"? Click here to reset.
                    </Button>
                </CardFooter>
            </Card>
        </div>
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

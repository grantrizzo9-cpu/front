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
import { Loader2, Users, ShieldAlert, ShieldCheck, ExternalLink, RefreshCcw } from "lucide-react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile, User } from "firebase/auth";
import { doc, getDoc, writeBatch, serverTimestamp, collection } from "firebase/firestore";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
    const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
    const [apiKeyBlocked, setApiKeyBlocked] = useState(false);

    const [planId, setPlanId] = useState('starter');
    const [referralCode, setReferralCode] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const plan = params.get('plan');
        const ref = params.get('ref');
        if (plan) setPlanId(plan);
        if (ref) setReferralCode(ref);
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

    const postSignupFlow = async (user: User, finalUsername: string, refCode: string | null) => {
        const batch = writeBatch(firestore);
        const userDocRef = doc(firestore, "users", user.uid);
        
        let referrerUid: string | null = null;
        if (refCode) {
            const referrerUsernameDoc = await getDoc(doc(firestore, "usernames", refCode.toLowerCase()));
            if (referrerUsernameDoc.exists()) {
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

        await batch.commit();

        toast({ title: "Account Created!", description: "Welcome! We're redirecting you to activate your plan." });
        router.push(`/dashboard/upgrade?plan=${plan.id}`);
    };

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsProcessing(true);
        setUnauthorizedDomain(null);
        setApiKeyBlocked(false);
        
        const finalUsername = username.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        const refCodeFromUrl = params.get('ref');

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
            await postSignupFlow(userCredential.user, finalUsername, refCodeFromUrl);

        } catch (error: any) {
            console.error("Signup error:", error.code, error.message);
            
            if (error.message?.toLowerCase().includes('referer-blocked') || error.message?.toLowerCase().includes('offline')) {
                setApiKeyBlocked(true);
                setIsProcessing(false);
                return;
            }

            if (error.code === 'auth/unauthorized-domain') {
                setUnauthorizedDomain(window.location.hostname);
                setIsProcessing(false);
                return;
            }

            toast({ variant: "destructive", title: "Signup Failed", description: error.message });
            setIsProcessing(false);
        }
    };

    const gcpConsoleUrl = `https://console.cloud.google.com/apis/credentials/key/${firebaseConfig.apiKey}?project=${firebaseConfig.projectId}`;
    
    return (
        <div className="space-y-6">
            {apiKeyBlocked && (
                <Alert variant="destructive" className="border-amber-500 bg-amber-50 shadow-lg">
                    <ShieldAlert className="h-5 w-5 text-amber-600" />
                    <AlertTitle className="font-bold text-red-800">Connection Failed (Offline/Blocked)</AlertTitle>
                    <AlertDescription className="text-sm space-y-3 text-red-700">
                        <p>Firebase is reporting "offline" because your <strong>Google Cloud API Key</strong> is blocking requests from Render.</p>
                        <div className="bg-white/50 p-3 rounded border border-red-200">
                            <p className="font-semibold text-xs uppercase tracking-wider mb-1">Required Action:</p>
                            <ol className="list-decimal list-inside space-y-1 text-xs">
                                <li>Click <strong>"Open API Settings"</strong>.</li>
                                <li>Find <strong>"Website restrictions"</strong>.</li>
                                <li>Add <code>https://{window.location.hostname}/*</code></li>
                                <li>Click <strong>Save</strong>.</li>
                            </ol>
                        </div>
                        <Button asChild variant="default" className="w-full bg-amber-600">
                            <a href={gcpConsoleUrl} target="_blank" rel="noopener noreferrer">Open API Settings <ExternalLink className="ml-2 h-4 w-4" /></a>
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {unauthorizedDomain && !apiKeyBlocked && (
                <Alert variant="destructive" className="border-red-500 bg-red-50">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle className="font-bold">Domain Security Block</AlertTitle>
                    <AlertDescription className="text-xs space-y-2">
                        <p>Firebase is blocking access because <strong>{unauthorizedDomain}</strong> is not yet authorized.</p>
                        <p className="font-semibold underline">Final Action Required:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Go to <strong>Firebase Console</strong>.</li>
                            <li>Navigate to <strong>Auth > Settings > Authorized Domains</strong>.</li>
                            <li>Add <code>{unauthorizedDomain}</code> to the list.</li>
                        </ol>
                    </AlertDescription>
                </Alert>
            )}

            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Create Your Account</CardTitle>
                    <CardDescription>
                        You're creating an account for the <strong>{plan.name}</strong> plan.
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
                        <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={!isFormValid || isProcessing}>
                            {isProcessing ? <Loader2 className="animate-spin" /> : "Create Account & Proceed"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter>
                    <div className="mt-4 text-center text-sm w-full">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline font-bold">Log in</Link>
                    </div>
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
          <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
          </div>
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

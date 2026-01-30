
'use client';

import { useState } from 'react';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { subscriptionTiers } from "@/lib/data";
import { Loader2, Users, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, writeBatch, serverTimestamp, Timestamp, collection } from "firebase/firestore";
import { PayPalPaymentButton } from "@/components/paypal-payment-button";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 fill-current"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.98-4.48 1.98-3.62 0-6.55-2.92-6.55-6.55s2.93-6.55 6.55-6.55c2.03 0 3.33.82 4.1 1.59l2.48-2.48C17.22 3.43 15.14 2 12.48 2 7.08 2 3 6.08 3 11.48s4.08 9.48 9.48 9.48c5.13 0 9.1-3.48 9.1-9.28 0-.6-.08-1.12-.2-1.68H3.48v.01z"></path></svg>
);


export function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();

    const [step, setStep] = useState<'details' | 'payment'>('details');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const planId = searchParams.get("plan") || 'starter';
    const referralCode = searchParams.get("ref");
    const plan = subscriptionTiers.find(p => p.id === planId) || subscriptionTiers[0];
    
    const isFormValid = username.length > 2 && email.includes('@') && password.length >= 6;

    const handleDetailsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const usernameDocRef = doc(firestore, "usernames", username);
            const usernameDoc = await getDoc(usernameDocRef);
            if (usernameDoc.exists()) {
                toast({ variant: "destructive", title: "Username Taken", description: "This username is already in use. Please choose another one." });
                setIsProcessing(false);
                return;
            }
            setStep('payment');
        } catch (error: any) {
            toast({ variant: "destructive", title: "Validation Error", description: error.message || "Could not validate user details." });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handlePaymentSuccess = async (details: any) => {
        setIsProcessing(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: username });

            const batch = writeBatch(firestore);
            const userDocRef = doc(firestore, "users", user.uid);
            
            const userData = {
                id: user.uid, email: user.email, username: username, referredBy: referralCode || null, isAffiliate: true, createdAt: serverTimestamp(),
                subscription: { tierId: plan.id, status: 'active' as const, startDate: serverTimestamp(), endDate: null, trialEndDate: null },
                paypalEmail: '', customDomain: null
            };
            batch.set(userDocRef, userData);

            const usernameDocRef = doc(firestore, "usernames", username);
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
                        id: newReferralRef.id, affiliateId: referrerId, referredUserId: user.uid, referredUserUsername: username,
                        planPurchased: plan.name, grossSale: plan.price, commission: commissionAmount, status: 'unpaid' as const,
                        date: serverTimestamp(), subscriptionId: user.uid,
                    });
                }
            }

            await batch.commit();

            toast({ title: "Account Created & Subscription Active!", description: "Welcome! We're redirecting you to your dashboard." });
            router.push("/dashboard");

        } catch (error: any) {
            let description;
            switch (error.code) {
                case 'auth/email-already-in-use': description = "This email address is already in use by another account."; break;
                case 'auth/weak-password': description = "The password is too weak. Please use at least 6 characters."; break;
                default: description = error.message || "An unknown error occurred while creating your account after payment.";
            }
            toast({ variant: "destructive", title: "Account Creation Failed", description: `${description} Please contact support with your payment details.` });
        } finally {
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
                const batch = writeBatch(firestore);
                let g_username = (user.displayName || user.email?.split('@')[0] || `user${user.uid.substring(0,5)}`).replace(/[^a-zA-Z0-9]/g, '');
                const initialUsernameDoc = await getDoc(doc(firestore, "usernames", g_username));
                if (initialUsernameDoc.exists()) g_username = `${g_username}${Math.floor(100 + Math.random() * 900)}`;
                batch.set(doc(firestore, "usernames", g_username), { uid: user.uid });

                const trialEndDate = new Date();
                trialEndDate.setDate(trialEndDate.getDate() + 3);

                batch.set(userDocRef, {
                    id: user.uid, email: user.email, username: g_username, referredBy: referralCode, isAffiliate: true, createdAt: serverTimestamp(),
                    subscription: { tierId: plan.id, status: 'active', startDate: serverTimestamp(), endDate: null, trialEndDate: Timestamp.fromDate(trialEndDate) },
                    paypalEmail: '', customDomain: null
                });
                await batch.commit();
                toast({ title: "Account Created!", description: "Welcome! Your 3-day trial is active. You can upgrade from your dashboard." });
            } else {
                 toast({ title: "Login Successful", description: "Welcome back!" });
            }
            router.push("/dashboard");
        } catch (error: any) {
             toast({ variant: "destructive", title: "Google Sign-In Failed", description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
    const isPaypalConfigured = paypalClientId && !paypalClientId.includes('REPLACE_WITH');
    
    if (step === 'payment') {
        if (!isPaypalConfigured) {
             return (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Payment Service Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Payment Service Not Configured</AlertTitle>
                            <AlertDescription>
                                The application owner needs to configure the PayPal Client ID. Please add your `NEXT_PUBLIC_PAYPAL_CLIENT_ID` to the `.env` file and **restart the development server**.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                     <CardFooter className="flex-col items-stretch gap-4">
                        <Button variant="ghost" onClick={() => setStep('details')} disabled={isProcessing}>
                            Back to details
                        </Button>
                     </CardFooter>
                </Card>
             )
        }
        return (
            <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "AUD", intent: "capture" }}>
                <Card className="max-w-md mx-auto animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>Complete Your Purchase</CardTitle>
                        <CardDescription>
                            You are purchasing the <span className="font-bold text-primary">{plan.name}</span> plan. After payment, your account will be created.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">${plan.price.toFixed(2)}</span>
                            <span className="text-muted-foreground">AUD / day</span>
                        </div>
                        <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                            <span className="text-sm">{feature}</span>
                            </li>
                        ))}
                        </ul>
                    </CardContent>
                    <CardFooter className="flex-col items-stretch gap-4">
                        <div className="relative">
                            {isProcessing && (
                                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 rounded-md">
                                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                                    <p className="mt-2 text-sm text-muted-foreground">Processing payment...</p>
                                </div>
                            )}
                            <PayPalPaymentButton 
                                planId={plan.id}
                                onPaymentSuccess={handlePaymentSuccess}
                                onPaymentStart={() => setIsProcessing(true)}
                                onPaymentError={() => setIsProcessing(false)}
                                disabled={isProcessing}
                            />
                        </div>
                        <Button variant="ghost" onClick={() => setStep('details')} disabled={isProcessing}>
                            Back to details
                        </Button>
                    </CardFooter>
                </Card>
            </PayPalScriptProvider>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Create Your Account</CardTitle>
                <CardDescription>
                    You've selected the <strong>{plan.name}</strong> plan. Create your account to proceed to payment.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleDetailsSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isProcessing} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isProcessing} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password (min. 6 characters)</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isProcessing} />
                    </div>
                    {referralCode && (
                        <div className="flex items-center gap-3 text-sm text-primary border border-primary/20 bg-primary/5 p-3 rounded-lg">
                            <Users className="h-5 w-5 flex-shrink-0" />
                            <span>You were referred by: <span className="font-semibold">{referralCode}</span></span>
                        </div>
                    )}
                    <Button type="submit" className="w-full" disabled={!isFormValid || isProcessing}>
                        {isProcessing ? <Loader2 className="animate-spin" /> : "Continue to Payment"}
                    </Button>
                </form>
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
                </div>
                 <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
                    Sign Up with Google (Starts a Free Trial)
                </Button>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">Log in</Link>
                </div>
            </CardContent>
        </Card>
    );
}

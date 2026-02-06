
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, serverTimestamp, writeBatch, Timestamp } from "firebase/firestore";
import type { User as UserType } from "@/lib/types";
import { subscriptionTiers } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import type { OnApproveData, CreateSubscriptionData } from "@paypal/paypal-js";
import { Skeleton } from "@/components/ui/skeleton";


export function UpgradeContent() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

    const useSandbox = process.env.PAYPAL_SANDBOX !== 'false';
    const paypalClientId = useSandbox ? process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID : process.env.NEXT_PUBLIC_PAYPAL_LIVE_CLIENT_ID;

    const searchParams = useSearchParams();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user?.uid]);
    const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);
    
    useEffect(() => {
        const planId = searchParams.get('plan');
        if (planId && subscriptionTiers.some(t => t.id === planId)) {
            setSelectedTierId(planId);
        } else if (userData?.subscription?.status === 'inactive' && userData.subscription.tierId) {
            setSelectedTierId(userData.subscription.tierId);
        }
    }, [searchParams, userData]);

    const isLoading = isUserLoading || isUserDataLoading;
    
    const availableTiers = useMemo(() => {
        if (!userData?.subscription || userData.subscription.status === 'inactive') {
            return subscriptionTiers;
        }
        const currentTierPrice = subscriptionTiers.find(t => t.id === userData.subscription?.tierId)?.price ?? 0;
        return subscriptionTiers.filter(t => t.price > currentTierPrice);
    }, [userData]);

    const createSubscription = async (data: CreateSubscriptionData): Promise<string> => {
        setPaymentError(null);
        if (!selectedTierId || !user) {
            const errorMsg = "No subscription tier selected or user not logged in.";
            setPaymentError(errorMsg);
            return Promise.reject(new Error(errorMsg));
        }

        try {
            const response = await fetch('/api/paypal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create_subscription', planId: selectedTierId, customId: user.uid }),
            });

            const responseData = await response.json();
            if (response.ok && responseData.subscriptionId) {
                return responseData.subscriptionId;
            } else {
                const errorMsg = responseData.debug || responseData.error || "Failed to create subscription on the server.";
                setPaymentError(errorMsg);
                throw new Error(errorMsg);
            }
        } catch (e: any) {
            const errorMsg = `Network error or server is unreachable: ${e.message}`;
            setPaymentError(errorMsg);
            return Promise.reject(e);
        }
    };

    const onApprove = async (data: OnApproveData): Promise<void> => {
        setIsProcessing(true);
        setPaymentError(null);

        try {
            if (!userDocRef || !selectedTierId || !firestore || !user || !userData) {
                throw new Error("User session or plan not found after payment.");
            }
            
            const tier = subscriptionTiers.find(t => t.id === selectedTierId);
            if (!tier) throw new Error("Selected plan details not found after payment.");
            
            const isUpgrade = userData.subscription?.status === 'active';
            const oldSubscriptionId = userData.subscription?.paypalSubscriptionId;

            // If this is an upgrade, cancel the old subscription first.
            if (isUpgrade && oldSubscriptionId) {
                console.log(`Cancelling old subscription: ${oldSubscriptionId}`);
                const cancelResponse = await fetch('/api/paypal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'cancel_subscription',
                        subscriptionId: oldSubscriptionId,
                        reason: `Upgrading to ${selectedTierId} plan.`
                    }),
                });

                if (!cancelResponse.ok) {
                    const errorData = await cancelResponse.json();
                    console.warn("Failed to cancel old subscription, but proceeding with upgrade:", errorData.error || 'Unknown cancellation error');
                    toast({
                        variant: "default",
                        title: "Upgrade Notice",
                        description: "Your new plan is active, but we couldn't automatically cancel your old one. Please manage it in your PayPal account to avoid double billing.",
                        duration: 10000,
                    });
                } else {
                    console.log("Old subscription cancelled successfully.");
                }
            }
            
            const batch = writeBatch(firestore);
            
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 3);

            const newSubscriptionData = {
                tierId: selectedTierId,
                status: 'active' as const,
                startDate: serverTimestamp(),
                endDate: null,
                trialEndDate: isUpgrade ? null : Timestamp.fromDate(trialEnd),
                paypalSubscriptionId: data.subscriptionID,
            };
            
            batch.update(userDocRef, { subscription: newSubscriptionData });
            
            // If this is a new user activation AND they were referred...
            if (!isUpgrade && userData.referredBy) {
                // Find the referral document in the referrer's subcollection.
                const referralDocRef = doc(firestore, 'users', userData.referredBy, 'referrals', user.uid);
                
                batch.update(referralDocRef, { 
                    activationStatus: 'activated',
                    grossSale: tier.price,
                    commission: 0,
                });
            }
            
            await batch.commit();

            toast({ title: isUpgrade ? "Subscription Upgraded!" : "Trial Activated!", description: `You now have access to the ${tier.name} plan.` });
            router.push('/dashboard');

        } catch (error: any) {
             const errorMsg = `Post-payment processing failed: ${error.message}`;
             setPaymentError(errorMsg);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const onError = (err: any) => {
        // This error is now primarily set by createSubscription, but this is a good fallback.
        if (!paymentError) {
            const errorMsg = `A client-side error occurred with PayPal. Raw error: ${err.toString()}`;
            console.error("PayPal onError callback triggered.", err);
            setPaymentError(errorMsg);
        }
        setIsProcessing(false);
    };
    
    const isNewUser = !userData?.subscription || userData.subscription.status === 'inactive';
    const pageTitle = isNewUser ? "Activate Your Plan" : "Upgrade Your Plan";
    const pageDescription = isNewUser 
        ? "Pay the one-time activation fee to start your 3-day trial and get instant access to all tools."
        : `You are currently on the ${subscriptionTiers.find(t => t.id === userData?.subscription?.tierId)?.name || 'Unknown'} plan. Unlock more features by upgrading.`;

    if (!paypalClientId || paypalClientId.includes('REPLACE_WITH')) {
        const envString = useSandbox ? "Sandbox" : "Live";
        const missingVar = useSandbox ? "NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID" : "NEXT_PUBLIC_PAYPAL_LIVE_CLIENT_ID";
      return (
          <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold font-headline heading-red">{pageTitle}</h1>
                <p className="text-muted-foreground mt-2">{pageDescription}</p>
              </div>
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Payment Gateway Not Configured for {envString}</AlertTitle>
                  <AlertDescription>
                      The application's payment processing is not yet set up. The `{missingVar}` is missing from the `.env` file. Please add your PayPal Client ID to proceed.
                  </AlertDescription>
              </Alert>
          </div>
      );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-3xl font-bold font-headline heading-red">{pageTitle}</h1>
                <p className="text-muted-foreground mt-2">{pageDescription}</p>
            </div>
            
            <Alert>
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="font-bold">Important Information</AlertTitle>
                <AlertDescription>
                    Your first payment is a one-time activation fee. This fee goes to the platform owner and starts your 3-day trial. Recurring daily payments begin automatically after the trial.
                </AlertDescription>
            </Alert>


            {paymentError && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>A Payment Error Occurred</AlertTitle>
                    <AlertDescription className="break-words">{paymentError}</AlertDescription>
                </Alert>
            )}
            
            <PayPalScriptProvider options={{
                clientId: paypalClientId!,
                vault: true,
                intent: "subscription",
                "disable-funding": "sepa,bancontact,giropay,ideal,mybank,p24,sofort",
            }}>
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        <Skeleton className="h-[400px] w-full" />
                        <Skeleton className="h-[400px] w-full" />
                        <Skeleton className="h-[400px] w-full" />
                    </div>
                ) : selectedTierId ? (
                    (() => {
                        const tier = subscriptionTiers.find(t => t.id === selectedTierId);
                        if (!tier) return null;
                        return (
                            <Card className="max-w-md mx-auto animate-in fade-in-50 zoom-in-95">
                                <CardHeader>
                                    <CardTitle>Confirm Your Plan</CardTitle>
                                    <CardDescription>
                                        {isNewUser 
                                            ? <>You are activating a 3-day trial for the <span className="font-bold text-primary">{tier.name}</span> plan.</>
                                            : <>You are upgrading to the <span className="font-bold text-primary">{tier.name}</span> plan.</>
                                        }
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold">${tier.price.toFixed(2)}</span>
                                        <span className="text-muted-foreground">{isNewUser ? 'One-Time Activation Fee' : 'USD / day'}</span>
                                    </div>
                                    <ul className="space-y-3">
                                        {tier.features.map((feature, index) => (
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
                                                <p className="mt-2 text-sm text-muted-foreground">Processing...</p>
                                            </div>
                                        )}
                                        <PayPalButtons
                                            key={selectedTierId}
                                            style={{ layout: "vertical", label: "subscribe", tagline: false, height: 44 }}
                                            createSubscription={createSubscription}
                                            onApprove={onApprove}
                                            onError={onError}
                                            disabled={isProcessing}
                                            forceReRender={[selectedTierId]}
                                        />
                                    </div>
                                    <Button variant="ghost" onClick={() => { setSelectedTierId(null); setPaymentError(null); }} disabled={isProcessing}>
                                        Choose a different plan
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })()
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {availableTiers.length > 0 ? availableTiers.map((tier) => (
                        <Card 
                            key={tier.id} 
                            className={cn(
                            "flex flex-col transition-all hover:shadow-lg",
                            tier.isMostPopular ? "border-primary ring-2 ring-primary shadow-lg" : ""
                            )}
                        >
                            {tier.isMostPopular && (
                            <div className="bg-primary text-primary-foreground text-center py-1.5 text-sm font-semibold rounded-t-lg">
                                Most Popular
                            </div>
                            )}
                            <CardHeader>
                            <CardTitle className="font-headline text-xl">{tier.name}</CardTitle>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">${tier.price.toFixed(2)}</span>
                                <span className="text-muted-foreground">USD / day</span>
                            </div>
                            <CardDescription>{tier.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                            <ul className="space-y-3">
                                {tier.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                                ))}
                            </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant={tier.isMostPopular ? "default" : "outline"} onClick={() => setSelectedTierId(tier.id)}>
                                {isNewUser ? "Activate " : "Upgrade to "}
                                {tier.name}
                                </Button>
                            </CardFooter>
                        </Card>
                        )) : (
                            <Card className="col-span-full">
                                <CardHeader>
                                    <CardTitle className="font-headline text-2xl">You're at the Top!</CardTitle>
                                    <CardDescription>Thank you for being a valued customer.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p>You are already subscribed to our highest-tier plan. There are no further upgrades available at this time.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </PayPalScriptProvider>
        </div>
    );
}

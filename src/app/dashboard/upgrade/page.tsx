'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, ArrowUpCircle, BadgeCheck, AlertTriangle } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import type { User as UserType } from "@/lib/types";
import { subscriptionTiers } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState, Suspense } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PayPalPaymentButton } from "@/components/paypal-payment-button";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Skeleton } from "@/components/ui/skeleton";


// Component for users with a paid subscription, allowing them to upgrade. No PayPal needed here.
function ExistingSubscriptionFlow({ currentTierId, onPlanChange }: {
    currentTierId: string;
    onPlanChange: (tierId: string) => void;
}) {
    const currentTier = subscriptionTiers.find(t => t.id === currentTierId);

    if (!currentTier) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Subscription Data Error</AlertTitle>
                <AlertDescription>
                    We couldn't find the details for your current subscription plan. Please contact support to resolve this issue.
                </AlertDescription>
            </Alert>
        )
    }
    
    const availableUpgrades = subscriptionTiers.filter(tier => tier.price > currentTier.price);

    if (availableUpgrades.length === 0) {
        return (
             <Card className="max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BadgeCheck className="h-6 w-6 text-green-500" />
                        <span>You're on the Top Plan!</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        You already have the best plan available. Thank you for being a valued customer!
                    </p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {availableUpgrades.map((tier) => (
              <Card 
                  key={tier.id} 
                  className={cn(
                      "flex flex-col",
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
                    <span className="text-muted-foreground">AUD / day</span>
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
                    <Button className="w-full" variant={tier.isMostPopular ? "default" : "outline"} onClick={() => onPlanChange(tier.id)}>
                        <ArrowUpCircle className="mr-2" />
                        Upgrade to {tier.name}
                    </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
    );
}

// Component for users without a subscription or on a trial. This is where payment happens.
function NewSubscriptionFlow({ onPaymentSuccess, onPaymentStart, onPaymentError, isProcessing, paypalClientId }: {
    onPaymentSuccess: (tierId: string) => (details: any) => Promise<void>;
    onPaymentStart: () => void;
    onPaymentError: () => void;
    isProcessing: boolean;
    paypalClientId: string;
}) {
    const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

    const isPaypalConfigured = paypalClientId && !paypalClientId.includes('REPLACE_WITH');

    // If a plan has been selected, show the payment view for that single plan.
    if (selectedTierId) {
        const tier = subscriptionTiers.find(t => t.id === selectedTierId);
        if (!tier) {
            return (
                <div className="text-center">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>The selected plan could not be found. Please go back and try again.</AlertDescription>
                    </Alert>
                    <Button onClick={() => setSelectedTierId(null)} variant="link" className="mt-4">
                        Go Back
                    </Button>
                </div>
            );
        }

        if (!isPaypalConfigured) {
            return (
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Payment Service Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Payment Service Not Configured</AlertTitle>
                            <AlertDescription>
                                The application is failing to read your PayPal Client ID from the `.env` file. Please ensure the `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set correctly and restart the server.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                    <CardFooter>
                        <Button variant="ghost" onClick={() => setSelectedTierId(null)}>Choose a different plan</Button>
                    </CardFooter>
                </Card>
            )
        }

        return (
             <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "AUD", intent: "capture" }}>
                <Card className="max-w-md mx-auto animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>Confirm Your Plan</CardTitle>
                        <CardDescription>You are purchasing the <span className="font-bold text-primary">{tier.name}</span> plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">${tier.price.toFixed(2)}</span>
                            <span className="text-muted-foreground">AUD / day</span>
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
                            <PayPalPaymentButton 
                                planId={tier.id}
                                onPaymentSuccess={onPaymentSuccess(tier.id)}
                                onPaymentStart={onPaymentStart}
                                onPaymentError={onPaymentError}
                                disabled={isProcessing}
                            />
                        </div>
                        <Button variant="ghost" onClick={() => setSelectedTierId(null)} disabled={isProcessing}>
                            Choose a different plan
                        </Button>
                    </CardFooter>
                </Card>
            </PayPalScriptProvider>
        );
    }

    // If no plan is selected yet, show all plans with "Select" buttons.
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {subscriptionTiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={cn(
                "flex flex-col",
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
                  <span className="text-muted-foreground">AUD / day</span>
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
                    Select {tier.name}
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
    );
}

function UpgradePageContent() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user?.uid]);
    const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);
    
    const isLoading = isUserLoading || isUserDataLoading;

    if (isLoading) {
        return (
             <div className="flex justify-center items-center h-full p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    const isOnTrial = userData?.subscription?.trialEndDate && userData.subscription.trialEndDate.toDate() > new Date();
    const hasPaidSubscription = userData?.subscription && !isOnTrial;

    const handlePlanChange = (tierId: string) => {
        if (!userDocRef) return;
        updateDocumentNonBlocking(userDocRef, { 'subscription.tierId': tierId });
        toast({ title: "Plan Upgraded!", description: `Your plan has been successfully upgraded.` });
    };

    const handlePaymentSuccess = (tierId: string) => async (details: any) => {
        if (!userDocRef) return;
        // This will now end the trial and start a paid subscription.
        const newSubscription = {
          tierId: tierId,
          status: 'active' as 'active',
          startDate: serverTimestamp(),
          endDate: null,
          trialEndDate: null, // End the trial
        };
        updateDocumentNonBlocking(userDocRef, { subscription: newSubscription });
        toast({ title: "Subscription Activated!", description: "You've successfully subscribed." });
        setIsProcessing(false);
    };
    
    const shouldShowPaymentFlow = !hasPaidSubscription;
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">
                    {hasPaidSubscription ? "Upgrade Your Plan" : (isOnTrial ? "End Trial & Choose Plan" : "Choose Your Plan")}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {hasPaidSubscription 
                        ? `You are currently on the ${subscriptionTiers.find(t => t.id === userData.subscription?.tierId)?.name || 'Unknown'} plan. Unlock more features by upgrading.`
                        : "Choose a plan below to start your paid subscription."
                    }
                </p>
            </div>

            {shouldShowPaymentFlow ? (
                <NewSubscriptionFlow
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentStart={() => setIsProcessing(true)}
                    onPaymentError={() => setIsProcessing(false)}
                    isProcessing={isProcessing}
                    paypalClientId={paypalClientId}
                />
            ) : (
                <ExistingSubscriptionFlow 
                    currentTierId={userData.subscription!.tierId}
                    onPlanChange={handlePlanChange}
                />
            )}
        </div>
    );
}

function UpgradeLoadingSkeleton() {
    return (
        <div className="space-y-8">
            <div className='space-y-2'>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
}

export default function UpgradePage() {
    return (
        <Suspense fallback={<UpgradeLoadingSkeleton />}>
            <UpgradePageContent />
        </Suspense>
    );
}

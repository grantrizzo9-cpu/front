
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, ArrowUpCircle, BadgeCheck, Star, AlertTriangle } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking, useCollection } from "@/firebase";
import { doc, serverTimestamp, Timestamp, collection } from "firebase/firestore";
import type { User as UserType, Referral } from "@/lib/types";
import { subscriptionTiers } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PayPalPaymentButton } from "@/components/paypal-payment-button";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";


// Component for users with a subscription, allowing them to upgrade. No PayPal needed here.
function ExistingSubscriptionFlow({ currentTierId, onPlanChange }: {
    currentTierId: string;
    onPlanChange: (tierId: string) => void;
}) {
    const currentTier = subscriptionTiers.find(t => t.id === currentTierId);

    // SAFETY CHECK: If the user's plan ID from the database doesn't match any known plan.
    if (!currentTier) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Subscription Data Error</AlertTitle>
                <AlertDescription>
                    We couldn't find the details for your current subscription plan. This can happen with older trial accounts. Please contact support to resolve this issue.
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

// Component for users without a subscription. This is where payment happens.
function NewSubscriptionFlow({ onPaymentSuccess, onPaymentStart, onPaymentError, isProcessing }: {
    onPaymentSuccess: (tierId: string) => (details: any) => Promise<void>;
    onPaymentStart: () => void;
    onPaymentError: () => void;
    isProcessing: boolean;
}) {
    const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

    // If a plan has been selected, show the payment view for that single plan.
    if (selectedTierId) {
        const tier = subscriptionTiers.find(t => t.id === selectedTierId);
        if (!tier) {
            // Fallback in case of an error.
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

        // --- PAYMENT MODE ---
        return (
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
        );
    }

    // --- SELECTION MODE ---
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

// The main page component that orchestrates everything.
export default function UpgradePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  const referralsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'referrals');
  }, [firestore, user?.uid]);
  const { data: referrals, isLoading: referralsLoading } = useCollection<Referral>(referralsQuery);
  
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const isLoading = isUserLoading || isUserDataLoading || referralsLoading;

  const handlePlanChange = (tierId: string) => {
    if (!userDocRef) return;
    updateDocumentNonBlocking(userDocRef, {
        'subscription.tierId': tierId,
    });
    toast({
      title: "Plan Upgraded!",
      description: `Your plan has been successfully upgraded.`,
    });
  };

  const handlePaymentSuccess = (tierId: string) => async (details: any) => {
    if (!userDocRef) return;
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 3);
    const newSubscription = {
      tierId: tierId,
      status: 'active' as 'active',
      startDate: serverTimestamp(),
      endDate: null,
      trialEndDate: Timestamp.fromDate(trialEndDate),
    };
    updateDocumentNonBlocking(userDocRef, { subscription: newSubscription });
    toast({
      title: "Plan Activated!",
      description: "You've successfully subscribed. Your 3-day trial starts now!",
    });
  };
  
  const handleEarlyUpgrade = () => {
    if (!userDocRef) return;
    setIsProcessing(true);
    updateDocumentNonBlocking(userDocRef, { 'subscription.trialEndDate': null });
    setTimeout(() => {
        toast({
            title: "Upgrade Complete!",
            description: "Your trial has ended and your full subscription is active. You can now earn commissions.",
        });
        setIsProcessing(false);
    }, 1500);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasSubscription = !!userData?.subscription;
  const isOnTrial = hasSubscription && userData.subscription.trialEndDate && userData.subscription.trialEndDate.toDate() > new Date();
  const referralCount = referrals?.length ?? 0;
  const canEarlyUpgrade = isOnTrial && referralCount >= 2;

  return (
      <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">
                {hasSubscription ? "Upgrade Your Plan" : "Choose Your Plan"}
            </h1>
            <p className="text-muted-foreground mt-2">
                {hasSubscription 
                    ? `You are currently on the ${subscriptionTiers.find(t => t.id === userData.subscription?.tierId)?.name || 'Unknown'} plan. Unlock more features by upgrading.`
                    : "You don't have an active subscription. Choose a plan below to get started."
                }
            </p>
        </div>

        {canEarlyUpgrade && (
            <Alert className="border-accent bg-accent/5 max-w-2xl">
                <Star className="h-4 w-4 text-accent" />
                <AlertTitle className="font-bold text-accent">Unlock Your Commissions Now!</AlertTitle>
                <AlertDescription>
                    You've referred {referralCount} people during your trial! You can end your trial now to start your paid subscription and begin earning commissions from your referrals immediately.
                    <Button onClick={handleEarlyUpgrade} disabled={isProcessing} className="mt-4 w-full sm:w-auto">
                        {isProcessing ? (
                            <><Loader2 className="animate-spin mr-2" /> Upgrading...</>
                        ) : (
                            "Upgrade Now & Start Earning"
                        )}
                    </Button>
                </AlertDescription>
            </Alert>
        )}

        {hasSubscription ? (
            <ExistingSubscriptionFlow 
                currentTierId={userData.subscription!.tierId}
                onPlanChange={handlePlanChange}
            />
        ) : (
            (!paypalClientId || paypalClientId.includes('REPLACE_WITH')) 
            ? (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Payment Service Not Configured</AlertTitle>
                    <AlertDescription>
                        The application owner needs to configure the PayPal Client ID in the environment variables to enable subscriptions. Please add your `NEXT_PUBLIC_PAYPAL_CLIENT_ID` to the `.env` file.
                    </AlertDescription>
                </Alert>
            ) : (
                <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "AUD", intent: "capture" }}>
                    <NewSubscriptionFlow
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentStart={() => setIsProcessing(true)}
                        onPaymentError={() => setIsProcessing(false)}
                        isProcessing={isProcessing}
                    />
                </PayPalScriptProvider>
            )
        )}
      </div>
  );
}

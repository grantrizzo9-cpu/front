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
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PayPalPaymentButton } from "@/components/paypal-payment-button";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;


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

  const isLoading = isUserLoading || isUserDataLoading || referralsLoading;

  const handlePlanChange = (tierId: string) => {
    if (!user) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    updateDocumentNonBlocking(userDocRef, {
        'subscription.tierId': tierId,
    });

    toast({
      title: "Plan Upgraded!",
      description: `Your plan has been successfully upgraded.`,
    });
  };

  const handlePaymentSuccess = (tierId: string) => async (details: any) => {
    if (!user || !userDocRef) return;
    
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 3);

    const newSubscription = {
      tierId: tierId,
      status: 'active' as 'active',
      startDate: serverTimestamp(),
      endDate: null,
      trialEndDate: Timestamp.fromDate(trialEndDate),
    };

    updateDocumentNonBlocking(userDocRef, {
        subscription: newSubscription
    });

    toast({
      title: "Plan Activated!",
      description: "You've successfully subscribed. Your 3-day trial starts now!",
    });
  };
  
  const handleEarlyUpgrade = () => {
    if (!user || !userDocRef) return;
    setIsProcessing(true);

    updateDocumentNonBlocking(userDocRef, {
        'subscription.trialEndDate': null,
    });

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

  const isOnTrial = userData?.subscription?.trialEndDate && userData.subscription.trialEndDate.toDate() > new Date();
  const referralCount = referrals?.length ?? 0;
  const canEarlyUpgrade = isOnTrial && referralCount >= 2;

  if (!userData?.subscription) {
      if (!paypalClientId || paypalClientId.includes('REPLACE_WITH')) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Choose Your Plan</h1>
                    <p className="text-muted-foreground mt-2">You don't have an active subscription. Please configure payment services to subscribe.</p>
                </div>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Payment Service Not Configured</AlertTitle>
                    <AlertDescription>
                        The application owner needs to configure the PayPal Client ID in the environment variables to enable subscriptions. Please add your `NEXT_PUBLIC_PAYPAL_CLIENT_ID` to the `.env` file.
                    </AlertDescription>
                </Alert>
            </div>
        )
      }

      return (
        <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "AUD", intent: "capture" }}>
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold font-headline">Choose Your Plan</h1>
              <p className="text-muted-foreground mt-2">You don't have an active subscription. Choose and pay for a plan below to get started.</p>
            </div>
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
                  <CardFooter className="flex-col items-stretch">
                     <div className="relative">
                        {isProcessing && (
                            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 rounded-md">
                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                            </div>
                        )}
                        <PayPalPaymentButton 
                            planId={tier.id}
                            onPaymentSuccess={handlePaymentSuccess(tier.id)}
                            onPaymentStart={() => setIsProcessing(true)}
                            onPaymentError={() => setIsProcessing(false)}
                            disabled={isProcessing}
                        />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </PayPalScriptProvider>
      );
  }
  
  const currentTier = subscriptionTiers.find(t => t.id === userData.subscription?.tierId);
  const availableUpgrades = currentTier 
    ? subscriptionTiers.filter(tier => tier.price > currentTier.price) 
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Upgrade Your Plan</h1>
        <p className="text-muted-foreground">
            You are currently on the <span className="font-semibold text-primary">{currentTier?.name}</span> plan. Unlock more features by upgrading.
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
      
      {availableUpgrades.length > 0 ? (
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
                    <Button className="w-full" variant={tier.isMostPopular ? "default" : "outline"} onClick={() => handlePlanChange(tier.id)}>
                        <ArrowUpCircle className="mr-2" />
                        Upgrade to {tier.name}
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
      ) : (
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
      )}
    </div>
  );
}

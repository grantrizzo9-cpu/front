'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, serverTimestamp, Timestamp } from "firebase/firestore";
import type { User as UserType } from "@/lib/types";
import { subscriptionTiers } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function UpgradePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  const isLoading = isUserLoading || isUserDataLoading;

  const handlePlanChange = (tierId: string) => {
    if (!user) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    updateDocumentNonBlocking(userDocRef, {
        'subscription.tierId': tierId,
    });

    toast({
      title: "Plan Changed!",
      description: `Your plan has been successfully changed.`,
    });
  };

  const handlePurchaseClick = (tierId: string) => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // SCENARIO 1: User has NO subscription. Show all plans for purchase.
  if (!userData?.subscription) {
      return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold font-headline">Choose Your Plan</h1>
              <p className="text-muted-foreground mt-2">You don't have an active subscription. Choose a plan below to get started.</p>
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
                      <span className="text-muted-foreground">/ day</span>
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
                     <Button className="w-full" variant={tier.isMostPopular ? "default" : "outline"} onClick={() => handlePurchaseClick(tier.id)}>
                        Choose Plan
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
      )
  }

  // SCENARIO 2: User HAS a subscription. Show current plan and cheaper options for downgrade.
  const currentTierId = userData.subscription.tierId;
  const currentTier = subscriptionTiers.find(t => t.id === currentTierId);
  const currentPrice = currentTier?.price ?? Infinity;

  const availableTiers = subscriptionTiers
    .filter(tier => tier.price <= currentPrice)
    .sort((a, b) => b.price - a.price); // Sort from most to least expensive
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Change Plan</h1>
        <p className="text-muted-foreground">
            You are currently on the <span className="font-semibold text-primary">{currentTier?.name}</span> plan. You can select a different plan below.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {availableTiers.map((tier) => (
            <Card 
                key={tier.id} 
                className={cn(
                    "flex flex-col",
                    tier.id === currentTierId ? "border-primary ring-2 ring-primary" : ""
                )}
            >
              <CardHeader>
                <CardTitle className="font-headline text-xl">{tier.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${tier.price.toFixed(2)}</span>
                  <span className="text-muted-foreground">/ day</span>
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
                {tier.id === currentTierId ? (
                    <Button className="w-full" disabled>Current Plan</Button>
                ) : (
                    <Button className="w-full" variant="outline" onClick={() => handlePlanChange(tier.id)}>
                        Downgrade to {tier.name}
                    </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
    </div>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import type { User as UserType } from "@/lib/types";
import { subscriptionTiers } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

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

  const handleUpgradeClick = (tierId: string) => {
    if (!user) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    updateDocumentNonBlocking(userDocRef, {
        'subscription.tierId': tierId,
    });

    toast({
      title: "Upgrade Successful!",
      description: `Your plan has been upgraded.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!userData?.subscription) {
      return (
          <div className="space-y-8 text-center">
            <div>
              <h1 className="text-3xl font-bold font-headline">Upgrade Your Plan</h1>
              <p className="text-muted-foreground mt-2">You don't have an active subscription. Choose a plan to get started.</p>
            </div>
             <Button asChild>
                <Link href="/pricing">View Plans</Link>
            </Button>
          </div>
      )
  }

  const currentTierId = userData.subscription.tierId;
  const currentTier = subscriptionTiers.find(t => t.id === currentTierId);
  const currentPrice = currentTier?.price ?? 0;

  const upgradeableTiers = subscriptionTiers.filter(tier => tier.price > currentPrice);
  
  const isHighestTier = upgradeableTiers.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Upgrade Your Plan</h1>
        <p className="text-muted-foreground">
            You are currently on the <span className="font-semibold text-primary">{currentTier?.name}</span> plan.
        </p>
      </div>

      {isHighestTier ? (
         <Card>
            <CardHeader>
                <CardTitle>You're at the top!</CardTitle>
                <CardDescription>You are already on our highest available plan. Thank you for being a top-tier member!</CardDescription>
            </CardHeader>
         </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {upgradeableTiers.map((tier) => (
            <Card key={tier.id} className="flex flex-col">
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
                 <Button className="w-full" onClick={() => handleUpgradeClick(tier.id)}>
                    Upgrade
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

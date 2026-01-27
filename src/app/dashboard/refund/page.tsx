"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Referral } from "@/lib/types";

export default function RefundPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const referralsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'referrals');
  }, [firestore, user]);

  const { data: referrals, isLoading: referralsLoading } = useCollection<Referral>(referralsRef);
  
  const referralCount = referrals?.length ?? 0;
  const isEligible = referralCount < 2;
  const isLoading = isUserLoading || referralsLoading;

  const handleRefundRequest = () => {
    // This would trigger a server action to:
    // 1. Verify eligibility (fewer than 2 referrals).
    // 2. Process a refund for the most recent daily charge via PayPal.
    // 3. Log the refund event.
    toast({
      title: "Refund Request Submitted",
      description: "Your request is being processed. You'll receive a confirmation email shortly.",
      variant: "default",
    });
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-full p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold font-headline">Our Success Guarantee</h1>
        <p className="text-muted-foreground">We're committed to your success. As long as you have fewer than 2 referrals, you can request a refund for your daily fee.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Refund Eligibility</CardTitle>
          <CardDescription>
            Our program is designed so two referrals can put you in profit. We guarantee your success.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Alert variant="default" className="border-primary/50 bg-primary/5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">Your Risk-Free Guarantee</AlertTitle>
              <AlertDescription>
                  We stand by our promise. If you haven&apos;t made at least two referrals, you are eligible for a refund of your daily subscription fee. You can continue to request a refund each day until you reach this goal.
              </AlertDescription>
            </Alert>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="font-semibold text-lg">Your Current Referrals: {referralCount}</p>
                {isEligible ? (
                    <p className="text-green-600">You are eligible for a refund.</p>
                ) : (
                    <p className="text-destructive">You are not eligible for a refund (2 or more referrals).</p>
                )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleRefundRequest} disabled={!isEligible} className="w-full">
              Request Refund for Today
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

export default function RefundPage() {
  const { toast } = useToast();
  
  // In a real app, this data would come from the user's record in Firestore
  const referralCount = 1; // Example value

  const isEligible = referralCount < 2;

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

            <Card className="bg-secondary/50">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Status</CardTitle>
                   <p className={`text-sm font-bold ${isEligible ? 'text-green-600' : 'text-destructive'}`}>
                      {isEligible ? "Eligible for Refund" : "In Profit! 🎉"}
                  </p>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{referralCount}</div>
                  <p className="text-xs text-muted-foreground">
                      successful referrals made
                  </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4">
           <Button
              size="lg"
              onClick={handleRefundRequest}
              disabled={!isEligible}
              variant={isEligible ? "default" : "secondary"}
              >
              {isEligible ? "Request Refund for Today's Fee" : "You're Profitable!"}
          </Button>
          {!isEligible && (
              <p className="text-sm text-muted-foreground text-center">
                  Congratulations! With 2 or more referrals, you&apos;re earning more than your daily fee.
              </p>
          )}
        </CardFooter>
      </Card>
      
    </div>
  );
}

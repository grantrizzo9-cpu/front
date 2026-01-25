"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function RefundPage() {
  const { toast } = useToast();
  
  // In a real app, this data would come from the user's record in Firestore
  const referralCount = 1; // Example value

  const hasLessThan2Referrals = referralCount < 2;
  const isEligible = hasLessThan2Referrals;

  const handleRefundRequest = () => {
    // This would trigger a server action to:
    // 1. Verify eligibility (fewer than 2 referrals).
    // 2. Process a refund for the most recent daily charge via PayPal.
    // 3. Log the refund event.
    toast({
      title: "Refund Request Submitted",
      description: "Your request for today's fee is being processed. You will be notified via email.",
      variant: "default",
    });
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold font-headline">Request a Refund</h1>
        <p className="text-muted-foreground">Review our success guarantee and request a refund if eligible.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Success Guarantee & Refund Policy</CardTitle>
          <CardDescription>
            Our guarantee ensures you don't pay until you're profitable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Eligibility Criteria</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>You are eligible for a refund of your daily fee as long as you have made <strong>fewer than 2</strong> successful referrals.</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Card className="bg-secondary/50">
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Referrals Made</p>
                        <p className={`text-lg font-bold ${hasLessThan2Referrals ? 'text-green-600' : 'text-destructive'}`}>
                            {referralCount} / 2
                        </p>
                    </div>
                </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button
          size="lg"
          onClick={handleRefundRequest}
          disabled={!isEligible}
          variant={isEligible ? "default" : "secondary"}
        >
          {isEligible ? "Request Daily Refund" : "Not Eligible for Refund"}
        </Button>
        {!isEligible && (
            <p className="text-sm text-muted-foreground mt-2">
                You have 2 or more referrals and are now profitable!
            </p>
        )}
      </div>
    </div>
  );
}

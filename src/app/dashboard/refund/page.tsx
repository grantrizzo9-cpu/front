"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function RefundPage() {
  const { toast } = useToast();
  
  // In a real app, this data would come from the user's record in Firestore
  const signupDate = new Date(new Date().getTime() - (12 * 60 * 60 * 1000)); // Signed up 12 hours ago
  const referralCount = 1;

  const hoursSinceSignup = (new Date().getTime() - signupDate.getTime()) / (1000 * 60 * 60);
  const isWithin24Hours = hoursSinceSignup <= 24;
  const hasLessThan2Referrals = referralCount < 2;
  const isEligible = isWithin24Hours && hasLessThan2Referrals;

  const handleRefundRequest = () => {
    // Here you would trigger a server action or API call to:
    // 1. Verify eligibility on the server-side.
    // 2. Mark the user's account for refund processing.
    // 3. Deactivate their subscription.
    // 4. Notify admins.
    toast({
      title: "Refund Request Submitted",
      description: "Your request is being processed. You will be notified via email.",
      variant: "default",
    });
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold font-headline">Request a Refund</h1>
        <p className="text-muted-foreground">Manage your subscription and request a refund if eligible.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Refund Policy</CardTitle>
          <CardDescription>
            Our refund policy is designed to be fair while protecting the integrity of our affiliate program.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Eligibility Criteria</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>You must be within <strong>24 hours</strong> of your initial sign-up and payment.</li>
                <li>You must have made <strong>fewer than 2</strong> successful referrals.</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Card className="bg-secondary/50">
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Time Since Signup</p>
                        <p className={`text-lg font-bold ${isWithin24Hours ? 'text-green-600' : 'text-destructive'}`}>
                            {hoursSinceSignup.toFixed(1)} / 24 hours
                        </p>
                    </div>
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
          variant={isEligible ? "destructive" : "secondary"}
        >
          {isEligible ? "Request Full Refund" : "Not Eligible for Refund"}
        </Button>
        {!isEligible && (
            <p className="text-sm text-muted-foreground mt-2">
                { !isWithin24Hours && "The 24-hour refund window has passed."}
                { isWithin24Hours && !hasLessThan2Referrals && "You have 2 or more referrals."}
            </p>
        )}
      </div>
    </div>
  );
}


"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, Loader2, Info } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, query, where, serverTimestamp } from "firebase/firestore";
import type { Referral, RefundRequest } from "@/lib/types";
import { useState } from "react";

export default function RefundPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch this user's referrals to check eligibility
  const referralsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'referrals');
  }, [firestore, user]);
  const { data: referrals, isLoading: referralsLoading } = useCollection<Referral>(referralsRef);
  
  // Fetch pending refund requests for this user from their own subcollection
  const refundRequestsRef = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'refundRequests'), where('status', '==', 'pending'));
  }, [firestore, user]);
  const { data: pendingRequests, isLoading: requestsLoading } = useCollection<RefundRequest>(refundRequestsRef);

  const referralCount = referrals?.length ?? 0;
  const isEligible = referralCount < 2;
  const hasPendingRequest = pendingRequests && pendingRequests.length > 0;
  const isLoading = isUserLoading || referralsLoading || requestsLoading;

  const handleRefundRequest = async () => {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Cannot process request. User not found.' });
        return;
    }
    setIsSubmitting(true);
    
    const requestData = {
        userId: user.uid,
        userUsername: user.displayName || 'N/A',
        userEmail: user.email,
        requestDate: serverTimestamp(),
        status: 'pending' as const,
        referralCountAtRequest: referralCount,
    };

    try {
        const requestsCollection = collection(firestore, 'users', user.uid, 'refundRequests');
        await addDocumentNonBlocking(requestsCollection, requestData);

        toast({
            title: "Refund Request Submitted",
            description: "Your request is being reviewed by our team. You'll be notified of the outcome.",
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: error.message || "An unknown error occurred.",
        });
    } finally {
        setIsSubmitting(false);
    }
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
            {hasPendingRequest && (
                 <Alert variant="default" className="border-accent/50 bg-accent/5">
                    <Info className="h-4 w-4 text-accent" />
                    <AlertTitle className="text-accent">Request Pending</AlertTitle>
                    <AlertDescription>
                        You already have a refund request pending review. We will process it shortly.
                    </AlertDescription>
                </Alert>
            )}
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
            <Button onClick={handleRefundRequest} disabled={!isEligible || hasPendingRequest || isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Request Refund for Today'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

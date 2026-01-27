
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldQuestion, CheckCircle } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, query, where, serverTimestamp } from "firebase/firestore";
import type { RefundRequest } from "@/lib/types";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function RequestRefundPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for existing pending refund requests for the current user
  const refundRequestQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, 'refundRequests'), 
        where('userId', '==', user.uid),
        where('status', '==', 'pending')
    );
  }, [firestore, user]);

  const { data: existingRequests, isLoading: isLoadingRequests } = useCollection<RefundRequest>(refundRequestQuery);
  const hasPendingRequest = existingRequests && existingRequests.length > 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !user || !user.email || !user.displayName) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to submit a request." });
        return;
    }
    if (reason.trim().length < 10) {
        toast({ variant: "destructive", title: "Reason too short", description: "Please provide a more detailed reason for your request." });
        return;
    }

    setIsSubmitting(true);
    
    const refundRef = collection(firestore, 'refundRequests');
    const newRefundRequest = {
        userId: user.uid,
        userEmail: user.email,
        userUsername: user.displayName,
        reason: reason,
        status: 'pending' as 'pending',
        requestedAt: serverTimestamp(),
    };

    try {
        await addDocumentNonBlocking(refundRef, newRefundRequest);
        toast({
            title: "Request Submitted",
            description: "Your refund request has been received. We will review it shortly.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "An error occurred while submitting your request. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const isLoading = isUserLoading || isLoadingRequests;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold font-headline">Request a Refund</h1>
        <p className="text-muted-foreground">We're sorry to see you go. Please let us know why you're requesting a refund.</p>
      </div>

      <Card>
        {isLoading ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : hasPendingRequest ? (
            <CardContent className="pt-6">
                <Alert variant="default" className="border-green-600/50 bg-green-50 text-green-900">
                    <CheckCircle className="h-4 w-4 !text-green-600" />
                    <AlertTitle className="font-semibold">Request Pending</AlertTitle>
                    <AlertDescription>
                        You already have a refund request being processed. Our team will get back to you soon.
                    </AlertDescription>
                </Alert>
            </CardContent>
        ) : (
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Refund Request Form</CardTitle>
                <CardDescription>
                  Your refund will be for your initial one-day payment. Please provide a reason below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                    id="reason"
                    name="reason"
                    placeholder="Please tell us why you are requesting a refund..." 
                    required 
                    rows={6}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={isSubmitting}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ShieldQuestion className="mr-2" />
                      Submit Refund Request
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
        )}
      </Card>
    </div>
  );
}

    
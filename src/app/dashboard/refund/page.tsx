'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldQuestion } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, useDoc } from "@/firebase";
import { collection, query, serverTimestamp, orderBy, doc, Timestamp } from "firebase/firestore";
import type { RefundRequest, User as UserType } from "@/lib/types";
import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { subscriptionTiers } from "@/lib/data";

export default function RequestRefundPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  // Fetch ALL refund requests for the current user, ordered by date
  const refundRequestQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, 'users', user.uid, 'refundRequests'), 
        orderBy('requestedAt', 'desc')
    );
  }, [firestore, user]);

  const { data: refundRequests, isLoading: isLoadingRequests } = useCollection<RefundRequest>(refundRequestQuery);
  
  // Check if there's a pending request to decide if the form should be shown
  const hasPendingRequest = useMemo(() => {
      return refundRequests?.some(r => r.status === 'pending') ?? false;
  }, [refundRequests]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !user || !user.email || !user.displayName) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to submit a request." });
        return;
    }
     if (!userData || !userData.subscription) {
        toast({ variant: "destructive", title: "Error", description: "Could not find an active subscription to refund." });
        return;
    }
    const tier = subscriptionTiers.find(t => t.id === userData.subscription?.tierId);
    if (!tier) {
        toast({ variant: "destructive", title: "Error", description: "Could not find subscription plan details." });
        return;
    }
    if (reason.trim().length < 10) {
        toast({ variant: "destructive", title: "Reason too short", description: "Please provide a more detailed reason for your request." });
        return;
    }

    setIsSubmitting(true);
    
    const refundRef = collection(firestore, 'users', user.uid, 'refundRequests');
    const newRefundRequest = {
        userId: user.uid,
        userEmail: user.email,
        userUsername: user.displayName,
        reason: reason,
        amount: tier.price,
        status: 'pending' as 'pending',
        requestedAt: serverTimestamp(),
    };

    const userDocForUpdateRef = doc(firestore, 'users', user.uid);

    // Use the non-blocking function and handle the result with .then() to manage UI state
    addDocumentNonBlocking(refundRef, newRefundRequest)
        .then(() => {
            // Also cancel their subscription upon successful refund request
            updateDocumentNonBlocking(userDocForUpdateRef, { subscription: null });

            toast({
                title: "Request Submitted",
                description: "Your subscription has been cancelled. You can choose a new plan from the 'Upgrade' page.",
            });
            setReason("");
        })
        .catch((error) => {
            // This is for unexpected client-side errors, not security rules
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "An unexpected client error occurred.",
            });
        })
        .finally(() => {
            setIsSubmitting(false);
        });
  };

  const isLoading = isUserLoading || isLoadingRequests || isUserDataLoading;
  const showForm = !hasPendingRequest && !isLoading && !!userData?.subscription;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold font-headline">Request a Refund</h1>
        <p className="text-muted-foreground">Submit a refund request or view the status of your existing requests.</p>
      </div>
      
      {isLoading && (
        <Card>
            <CardContent className="pt-6">
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </CardContent>
        </Card>
      )}

      {refundRequests && refundRequests.length > 0 && !isLoading && (
         <Card>
            <CardHeader>
                <CardTitle>Your Refund Requests</CardTitle>
                <CardDescription>A history of all your submitted refund requests.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date Requested</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {refundRequests.map(request => (
                            <TableRow key={request.id}>
                                <TableCell>{format(request.requestedAt.toDate(), 'PP')}</TableCell>
                                <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={
                                        request.status === 'processed' ? 'secondary' 
                                        : request.status === 'pending' ? 'default' 
                                        : 'destructive'
                                    }
                                    className={request.status === 'pending' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
                                    >
                                        {request.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>New Refund Request</CardTitle>
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
        </Card>
      )}
      
       {!isLoading && (!refundRequests || refundRequests.length === 0) && (
         <Card>
            <CardHeader>
                 <CardTitle>No Requests Found</CardTitle>
                 <CardDescription>You have not submitted any refund requests. Use the form below if you need to request one.</CardDescription>
            </CardHeader>
         </Card>
       )}

    </div>
  );
}

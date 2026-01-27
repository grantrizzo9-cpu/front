
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";
import type { RefundRequest } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { format } from "date-fns";

export default function AdminRefundsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  // Fetch all pending refund requests
  const pendingRequestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'refundRequests'), where('status', '==', 'pending'));
  }, [firestore]);

  const { data: requests, isLoading } = useCollection<RefundRequest>(pendingRequestsQuery);

  const handleProcessRefund = (requestId: string) => {
    if (!firestore) return;

    const requestDocRef = doc(firestore, 'refundRequests', requestId);
    updateDocumentNonBlocking(requestDocRef, { status: 'processed' });
    
    toast({
      title: "Refund Processed",
      description: "The request has been marked as processed. The user will be notified.",
    });
    // In a real app, this would also trigger the PayPal refund API call.
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Manage Refund Requests</h1>
        <p className="text-muted-foreground">Review and process user refund requests.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            {isLoading ? "Loading requests..." : 
              requests && requests.length > 0 
              ? `There are ${requests.length} pending refund requests.` 
              : "There are no pending refund requests."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests && requests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.sort((a,b) => a.requestDate.toMillis() - b.requestDate.toMillis()).map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.userUsername}</TableCell>
                    <TableCell>{request.userEmail}</TableCell>
                    <TableCell>{format(request.requestDate.toDate(), 'PPpp')}</TableCell>
                    <TableCell>{request.referralCountAtRequest}</TableCell>
                    <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleProcessRefund(request.id)}>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Process Refund
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <p>No pending refund requests.</p>
              <p className="text-sm">When users request a refund, it will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

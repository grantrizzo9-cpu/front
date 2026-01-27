
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import type { RefundRequest } from "@/lib/types";
import { useAdmin } from "@/hooks/use-admin";
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collectionGroup, query, where, doc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminRefundsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 1. Fetch all pending refund requests using a collection group query
  const refundRequestsQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collectionGroup(firestore, 'refundRequests'));
  }, [firestore, isAdmin]);
  const { data: refundRequests, isLoading: requestsLoading } = useCollection<RefundRequest>(refundRequestsQuery);

  const isLoading = isAdminLoading || requestsLoading;

  const handleProcessRefund = async (request: RefundRequest) => {
    if (!firestore) return;
    setProcessingId(request.id);
    
    // The request is in a subcollection, so we need the full path to its document.
    const requestDocRef = doc(firestore, 'users', request.userId, 'refundRequests', request.id);
    
    updateDocumentNonBlocking(requestDocRef, { status: 'processed' });
    
    toast({
      title: "Refund Processed",
      description: `Refund for ${request.userEmail} has been marked as processed.`,
    });
    
    // Simulate API call delay
    setTimeout(() => {
        setProcessingId(null);
    }, 1500)
  };

  const pendingRequests = useMemo(() => {
      return refundRequests?.filter(r => r.status === 'pending') ?? [];
  }, [refundRequests]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Manage Refunds</h1>
        <p className="text-muted-foreground">Review and process user refund requests.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Pending Refund Requests</CardTitle>
            <CardDescription>
                {isLoading ? "Loading requests..." : (
                    <>There are currently <span className="font-bold text-primary">{pendingRequests.length}</span> pending refund requests.</>
                )}
            </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : pendingRequests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.userUsername}</TableCell>
                      <TableCell>{request.userEmail}</TableCell>
                      <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                      <TableCell>{format(request.requestedAt.toDate(), 'PP')}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleProcessRefund(request)}
                            disabled={processingId === request.id}
                        >
                          {processingId === request.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <ShieldCheck className="mr-2 h-4 w-4" />
                          )}
                          Process Refund
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <ShieldCheck className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 font-semibold">All caught up!</p>
                    <p className="text-sm">There are no pending refund requests.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

    
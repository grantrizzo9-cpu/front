
'use client';

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Loader2, ShieldCheck } from "lucide-react";
import type { RefundRequest } from "@/lib/types";
import { useAdmin } from "@/hooks/use-admin";
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collectionGroup, query, doc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { StatCard } from "@/components/stat-card";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminRefundsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { isPlatformOwner, isLoading: isAdminLoading } = useAdmin();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isAdminLoading && !isPlatformOwner) {
      router.push('/dashboard');
    }
  }, [isPlatformOwner, isAdminLoading, router]);

  const refundRequestsQuery = useMemoFirebase(() => {
    if (!firestore || !isPlatformOwner) return null;
    return query(collectionGroup(firestore, 'refundRequests'));
  }, [firestore, isPlatformOwner]);
  const { data: refundRequests, isLoading: requestsLoading } = useCollection<RefundRequest>(refundRequestsQuery);

  const handleProcessRefund = async (request: RefundRequest) => {
    if (!firestore) return;
    setProcessingId(request.id);
    
    const requestDocRef = doc(firestore, 'users', request.userId, 'refundRequests', request.id);
    updateDocumentNonBlocking(requestDocRef, { status: 'processed' });
    
    toast({
      title: "Refund Processed",
      description: `Refund for ${request.userEmail} has been marked as processed.`,
    });
    
    setTimeout(() => {
        setProcessingId(null);
    }, 1500)
  };

  const pendingRequests = useMemo(() => {
      return refundRequests?.filter(r => r.status === 'pending') ?? [];
  }, [refundRequests]);

  const totalRefunded = useMemo(() => {
    return (
      refundRequests
        ?.filter((r) => r.status === "processed")
        .reduce((sum, r) => sum + (r.amount || 0), 0) ?? 0
    );
  }, [refundRequests]);

  // Shell-First: Instant structural render
  const isAuthorized = isPlatformOwner || isAdminLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold font-headline heading-red">Manage Refunds</h1>
        <p className="text-muted-foreground">Review and process user refund requests.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Total Refunded"
          value={(!isAuthorized || requestsLoading) ? "..." : `$${totalRefunded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
          description="Total amount processed for refunds."
        />
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Pending Refund Requests</CardTitle>
            <CardDescription>
                {(!isAuthorized || requestsLoading) ? "Loading requests..." : (
                    <>There are currently <span className="font-bold text-primary">{pendingRequests.length}</span> pending refund requests.</>
                )}
            </CardDescription>
        </CardHeader>
        <CardContent>
            {(!isAuthorized || requestsLoading) ? (
                <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : pendingRequests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Amount</TableHead>
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
                      <TableCell>${(request.amount ?? 0).toFixed(2)}</TableCell>
                      <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                      <TableCell>
                        {isHydrated && request.requestedAt ? format(request.requestedAt.toDate(), 'PP') : '...'}
                      </TableCell>
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

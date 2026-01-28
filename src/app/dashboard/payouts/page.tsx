'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Payout } from "@/lib/types";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export default function PayoutsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const payoutsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'payments');
  }, [firestore, user?.uid]);

  const { data: payouts, isLoading: payoutsLoading } = useCollection<Payout>(payoutsRef);

  const isLoading = isUserLoading || payoutsLoading;

  if (isLoading) {
      return (
          <div className="flex justify-center items-center h-full p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Payout History</h1>
        <p className="text-muted-foreground">Your complete history of daily commission payouts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payouts</CardTitle>
          <CardDescription>
            All payouts are sent daily via PayPal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payouts && payouts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">PayPal Transaction ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.sort((a,b) => b.date.toMillis() - a.date.toMillis()).map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-medium text-green-600">${payout.amount.toFixed(2)}</TableCell>
                    <TableCell>{format(payout.date.toDate(), 'PPpp')}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {payout.transactionId ? (
                        <Link href={`https://www.paypal.com/activity/payment/${payout.transactionId}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-end gap-2 hover:text-primary">
                            {payout.transactionId}
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                      ): (
                        <span>Processing</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center text-muted-foreground py-10">
                <p>No payout history to show.</p>
                <p className="text-sm">Your payouts will appear here once you start earning commissions.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Payout, User as UserType } from "@/lib/types";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function PayoutsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const payoutsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'payments');
  }, [firestore, user?.uid]);
  const { data: payouts, isLoading: payoutsLoading } = useCollection<Payout>(payoutsRef);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  const isLoading = isUserLoading || payoutsLoading || isUserDataLoading;

  const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userDocRef) return;
    
    const formData = new FormData(e.currentTarget);
    const newPaypalEmail = formData.get('paypal-email') as string;

    updateDocumentNonBlocking(userDocRef, { paypalEmail: newPaypalEmail });
    
    toast({
      title: "Changes Saved",
      description: "Your PayPal email has been updated.",
    });
  };

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
        <h1 className="text-3xl font-bold font-headline">Payouts</h1>
        <p className="text-muted-foreground">Manage your payout settings and view your payout history.</p>
      </div>
      
      <Card>
        <form onSubmit={handleSaveChanges}>
          <CardHeader>
            <CardTitle>Payout Information</CardTitle>
            <CardDescription>This is the PayPal email where your daily commissions will be sent.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="paypal-email">PayPal Email</Label>
              <Input id="paypal-email" name="paypal-email" type="email" defaultValue={userData?.paypalEmail || ''} required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>
            Your complete history of daily commission payouts.
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
             <div className="text-center text-muted-foreground py-10 space-y-4">
                <div>
                  <p>No payout history to show.</p>
                  <p className="text-sm">Your payouts will appear here once you start earning commissions.</p>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

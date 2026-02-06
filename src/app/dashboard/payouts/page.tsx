'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ArrowRight, Loader2, PartyPopper, ShieldCheck, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { Payout, User as UserType, Referral } from "@/lib/types";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo } from "react";

export default function PayoutsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { isAdmin } = useAdmin();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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
  
  const referralsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'referrals');
  }, [firestore, user?.uid]);
  const { data: referrals } = useCollection<Referral>(referralsRef);

  const referralCount = referrals?.length ?? 0;

  const sortedPayouts = useMemo(() => {
    if (!payouts) return [];
    return [...payouts].sort((a, b) => b.date.toMillis() - a.date.toMillis());
  }, [payouts]);

  const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userDocRef) return;
    const formData = new FormData(e.currentTarget);
    const newPaypalEmail = formData.get('paypal-email') as string;
    updateDocumentNonBlocking(userDocRef, { paypalEmail: newPaypalEmail });
    toast({ title: "Changes Saved", description: "Your PayPal email has been updated." });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold font-headline heading-red">Payouts</h1>
        <p className="text-muted-foreground">Manage your payout settings and history.</p>
      </div>

       {isAdmin ? (
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="flex-row items-center gap-4">
                    <ShieldCheck className="h-8 w-8 text-blue-600 flex-shrink-0" />
                    <div>
                        <CardTitle className="text-blue-800">Admin Payouts Unlocked</CardTitle>
                        <CardDescription className="text-blue-700">As an admin, your payouts are automatically enabled.</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        ) : referralCount >= 2 ? (
            <Card className="bg-green-50 border-green-200">
                <CardHeader className="flex-row items-center gap-4">
                    <PartyPopper className="h-8 w-8 text-green-600 flex-shrink-0" />
                    <div>
                        <CardTitle className="text-green-800">Payouts Unlocked!</CardTitle>
                        <CardDescription className="text-green-700">Congratulations on getting {referralCount} referrals!</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        ) : (
             <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="flex-row items-center gap-4">
                     <TrendingUp className="h-8 w-8 text-amber-600 flex-shrink-0" />
                    <div>
                        <CardTitle className="text-amber-800">Activate Your Payouts</CardTitle>
                        <CardDescription className="text-amber-700">
                            You have {referralCount} of 2 required referrals to start earning recurring commissions.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        )}
      
      <Card>
        <form onSubmit={handleSaveChanges}>
          <CardHeader>
            <CardTitle>Payout Information</CardTitle>
            <CardDescription>Commissions are sent to this PayPal email daily.</CardDescription>
          </CardHeader>
          <CardContent>
            {isUserDataLoading ? <Skeleton className="h-10 w-full" /> : (
              <div className="space-y-2">
                <Label htmlFor="paypal-email">PayPal Email</Label>
                <Input id="paypal-email" name="paypal-email" type="email" defaultValue={userData?.paypalEmail || ''} required />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUserDataLoading}>Save Changes</Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Your complete history of commission payouts.</CardDescription>
        </CardHeader>
        <CardContent>
          {payoutsLoading ? <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div> : sortedPayouts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Transaction ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPayouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-medium text-green-600">${payout.amount.toFixed(2)}</TableCell>
                    <TableCell>{isHydrated ? format(payout.date.toDate(), 'PPpp') : '...'}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {payout.transactionId ? (
                        <Link href={`https://www.paypal.com/activity/payment/${payout.transactionId}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-end gap-2 hover:text-primary">
                            {payout.transactionId} <ArrowRight className="h-3 w-3" />
                        </Link>
                      ): <span>Processing</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg bg-slate-50/50">
                <p>No payout history to show yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

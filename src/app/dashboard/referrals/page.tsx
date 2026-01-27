'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { Referral } from "@/lib/types";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Loader2 } from "lucide-react";

export default function ReferralsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const referralsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'referrals');
  }, [firestore, user]);

  const { data: referrals, isLoading: referralsLoading } = useCollection<Referral>(referralsRef);
  
  const isLoading = isUserLoading || referralsLoading;
  
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
        <h1 className="text-3xl font-bold font-headline">Your Referrals</h1>
        <p className="text-muted-foreground">A complete list of every user you've referred.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Referrals</CardTitle>
          <CardDescription>
            You have a total of {referrals?.length ?? 0} referrals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals && referrals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.sort((a,b) => b.date.toMillis() - a.date.toMillis()).map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">{referral.referredUserUsername}</TableCell>
                    <TableCell>{referral.planPurchased}</TableCell>
                    <TableCell>${referral.commission.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={referral.status === 'paid' ? 'secondary' : 'default'} className={referral.status === 'unpaid' ? 'bg-green-500 text-white hover:bg-green-600' : ''}>
                        {referral.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{format(referral.date.toDate(), 'PPpp')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <p>No referrals to show.</p>
              <p className="text-sm">Share your affiliate link to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

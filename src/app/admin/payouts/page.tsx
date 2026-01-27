"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import type { AdminPayout, Referral, User } from "@/lib/types";
import { useAdmin } from "@/hooks/use-admin";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup, query, where } from "firebase/firestore";

export default function AdminPayoutsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();

  // 1. Fetch all unpaid referrals
  const unpaidReferralsQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collectionGroup(firestore, 'referrals'), where('status', '==', 'unpaid'));
  }, [firestore, isAdmin]);
  const { data: unpaidReferrals, isLoading: referralsLoading } = useCollection<Referral>(unpaidReferralsQuery);

  // 2. Fetch all users to map affiliate IDs to user details
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, 'users');
  }, [firestore, isAdmin]);
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  // 3. Process and combine data to create the payout summary
  const payouts = useMemo((): AdminPayout[] => {
    if (!unpaidReferrals || !users) return [];

    const usersById = new Map(users.map(u => [u.id, u]));
    const payoutsMap = new Map<string, AdminPayout>();

    for (const referral of unpaidReferrals) {
      const affiliate = usersById.get(referral.affiliateId);
      if (!affiliate) continue;

      if (!payoutsMap.has(referral.affiliateId)) {
        payoutsMap.set(referral.affiliateId, {
          affiliateId: affiliate.id,
          affiliateUsername: affiliate.username,
          affiliateEmail: affiliate.email || '',
          paypalEmail: affiliate.paypalEmail || '',
          unpaidCommissions: 0,
          totalUnpaid: 0,
        });
      }

      const payout = payoutsMap.get(referral.affiliateId)!;
      payout.unpaidCommissions += 1;
      payout.totalUnpaid += referral.commission;
    }

    return Array.from(payoutsMap.values());
  }, [unpaidReferrals, users]);

  const totalPayoutAmount = payouts.reduce((sum, p) => sum + p.totalUnpaid, 0);

  const isLoading = isAdminLoading || referralsLoading || usersLoading;

  const handleProcessPayouts = () => {
    // This would trigger a complex server action:
    // 1. For each affiliate, call the PayPal Payouts API.
    // 2. On success, update all their 'unpaid' commissions to 'paid'.
    // 3. Create a new payout record for each affiliate.
    // 4. Log the entire batch operation.
    toast({
      title: "Processing Payouts...",
      description: `Sending a total of $${totalPayoutAmount.toFixed(2)} to ${payouts.length} affiliates.`,
    });
    // After a delay to simulate processing:
    setTimeout(() => {
        toast({
            title: "Payouts Processed!",
            description: "All commissions have been paid and records updated.",
        });
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Manage Payouts</h1>
        <p className="text-muted-foreground">Review and process daily affiliate commission payouts.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Daily Payout Summary</CardTitle>
                <CardDescription>
                    {isLoading ? "Loading payouts..." : payouts.length > 0 ? (
                        <>Total of <span className="font-bold text-primary">${totalPayoutAmount.toFixed(2)}</span> to be paid to <span className="font-bold text-primary">{payouts.length}</span> affiliates.</>
                    ) : (
                        "There are no pending payouts to process."
                    )}
                </CardDescription>
            </div>
            <Button size="lg" onClick={handleProcessPayouts} disabled={payouts.length === 0 || isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Process All Payouts
            </Button>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : payouts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Account Email</TableHead>
                    <TableHead>PayPal Email</TableHead>
                    <TableHead className="text-center">Unpaid Commissions</TableHead>
                    <TableHead className="text-right">Total Payout</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.affiliateId}>
                      <TableCell className="font-medium">{payout.affiliateUsername}</TableCell>
                      <TableCell>{payout.affiliateEmail}</TableCell>
                      <TableCell>{payout.paypalEmail || "Not Set"}</TableCell>
                      <TableCell className="text-center">{payout.unpaidCommissions}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">${payout.totalUnpaid.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <p>No pending payouts.</p>
                    <p className="text-sm">When affiliates have unpaid commissions, they will appear here.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

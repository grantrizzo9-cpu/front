
'use client';

import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { DollarSign, Users, BarChart, BrainCircuit, ArrowRight, Loader2, TrendingUp, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import type { Referral, User as UserType } from "@/lib/types";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, collectionGroup, doc } from "firebase/firestore";
import { useAdmin } from "@/hooks/use-admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMemo } from "react";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  // --- Unified Data Fetching ---
  // This query now dynamically fetches either personal referrals or all platform referrals
  // based on the user's admin status. This is more efficient and less error-prone.
  const referralsQuery = useMemoFirebase(() => {
    if (isAdminLoading || !user || !firestore) {
      return null; // Wait until we know the user's status and have services ready.
    }
    if (isAdmin) {
      return collectionGroup(firestore, 'referrals');
    }
    return collection(firestore, 'users', user.uid, 'referrals');
  }, [isAdmin, isAdminLoading, user, firestore]);

  const { data: referrals, isLoading: referralsLoading } = useCollection<Referral>(referralsQuery);
  
  const isLoading = isUserLoading || isUserDataLoading || referralsLoading || isAdminLoading;

  // --- Stats Calculations ---
  // These calculations now work on the unified 'referrals' data source.
  const totalCommission = referrals?.reduce((sum, r) => sum + r.commission, 0) ?? 0;
  const totalReferrals = referrals?.length ?? 0;
  const unpaidCommissions = referrals?.filter(r => r.status === 'unpaid').reduce((sum, r) => sum + r.commission, 0) ?? 0;
  const grossSalesValue = referrals?.reduce((sum, r) => sum + (r.commission / 0.70), 0) ?? 0; 
  const platformRevenue = grossSalesValue * 0.30;

  const recentReferrals = referrals
    ?.sort((a, b) => b.date.toMillis() - a.date.toMillis())
    .slice(0, 5) ?? [];

  const trialEndDate = userData?.subscription?.trialEndDate?.toDate();
  const isTrialActive = trialEndDate && trialEndDate > new Date();

  if (isLoading) {
      return (
          <div className="flex justify-center items-center h-full p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  // Admin View: A dedicated UI for platform-wide metrics.
  if (isAdmin) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform-wide affiliate activity summary.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Platform Revenue"
            value={`$${platformRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
            description="The 30% platform cut from all sales."
          />
          <StatCard
            title="Total Affiliate Payouts"
            value={`$${totalCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
            description="Total 70% commissions earned by all affiliates."
          />
          <StatCard
            title="Platform-Wide Referrals"
            value={`+${totalReferrals}`}
            icon={<Users className="h-5 w-5 text-muted-foreground" />}
            description="Total users referred across the platform."
          />
          <StatCard
            title="Total Gross Sales"
            value={`$${grossSalesValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<BarChart className="h-5 w-5 text-muted-foreground" />}
            description="Gross value of all sales across the platform."
          />
        </div>
         <Card>
          <CardHeader>
            <CardTitle>Recent Platform-Wide Referrals</CardTitle>
            <CardDescription>The latest sign-ups from all affiliates.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReferrals.length > 0 ? (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Referred User</TableHead>
                    <TableHead>Affiliate ID</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Commission</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentReferrals.map((referral) => (
                    <TableRow key={referral.id}>
                        <TableCell className="font-medium">{referral.referredUserUsername}</TableCell>
                        <TableCell className="font-mono text-xs">{referral.affiliateId}</TableCell>
                        <TableCell>{referral.planPurchased}</TableCell>
                        <TableCell>${referral.commission.toFixed(2)}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <p>No recent referrals across the platform.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular User View
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's a summary of your affiliate activity.</p>
      </div>

      {isTrialActive && (
        <Alert className="border-accent/50 bg-accent/5">
          <Info className="h-4 w-4 text-accent" />
          <AlertTitle className="text-accent">You're on a Trial!</AlertTitle>
          <AlertDescription>
            Your 3-day free trial will end on {format(trialEndDate, 'PP')}. Start referring to keep the momentum going!
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Your Total Earnings"
          value={`$${totalCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
          description="Your 70% base commission from all-time sales."
        />
        <StatCard
          title="Your Total Referrals"
          value={`+${totalReferrals}`}
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          description="Users who signed up using your link."
        />
        <StatCard
          title="Your Gross Sales Value"
          value={`$${grossSalesValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<BarChart className="h-5 w-5 text-muted-foreground" />}
          description="Gross value of sales from your referrals (100%)."
        />
         <StatCard
          title="Your Unpaid Commissions"
          value={`$${unpaidCommissions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-5 w-5 text-green-500" />}
          description="Your 70% share to be paid out tomorrow."
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Referrals</CardTitle>
            <CardDescription>A quick look at the latest sign-ups from your link.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReferrals.length > 0 ? (
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
                    {recentReferrals.map((referral) => (
                    <TableRow key={referral.id}>
                        <TableCell className="font-medium">{referral.referredUserUsername}</TableCell>
                        <TableCell>{referral.planPurchased}</TableCell>
                        <TableCell>${referral.commission.toFixed(2)}</TableCell>
                        <TableCell>
                        <Badge variant={referral.status === 'paid' ? 'secondary' : 'default'} className={referral.status === 'unpaid' ? 'bg-green-500 text-white' : ''}>
                            {referral.status}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-right">{format(referral.date.toDate(), 'PP')}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <p>No recent referrals to show.</p>
                    <p className="text-sm">Share your affiliate link to get started!</p>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                  <BrainCircuit className="w-6 h-6 text-primary" />
                  <span>Featured Tool: AI Content Generator</span>
              </CardTitle>
              <CardDescription>
                  Jumpstart your marketing efforts by creating high-quality content in seconds.
              </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-6">
              <p className="text-center text-muted-foreground">
                  Generate blog intros, social media posts, product descriptions, and more with the power of AI.
              </p>
          </CardContent>
          <CardFooter>
              <Button asChild className="w-full">
                  <Link href="/dashboard/ai-tools">
                      Go to AI Tools
                      <ArrowRight className="ml-2" />
                  </Link>
              </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

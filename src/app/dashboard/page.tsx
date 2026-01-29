
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

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  // Fetch referrals for the current user (for their personal dashboard view)
  const referralsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'referrals');
  }, [firestore, user?.uid]);

  const { data: personalReferrals, isLoading: referralsLoading } = useCollection<Referral>(referralsRef);
  
  // --- ADMIN ONLY ---
  // Fetch all referrals across the entire platform if the user is an admin
  const allReferralsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null; // Only run this query if the user is an admin
    return collectionGroup(firestore, 'referrals');
  }, [firestore, isAdmin]);
  const { data: allReferrals, isLoading: allReferralsLoading } = useCollection<Referral>(allReferralsQuery);
  // --- END ADMIN ONLY ---

  const isLoading = isUserLoading || isUserDataLoading || referralsLoading || (isAdmin && allReferralsLoading) || isAdminLoading;

  // --- Personal Stats Calculations ---
  const personalTotalCommission = personalReferrals?.reduce((sum, r) => sum + r.commission, 0) ?? 0;
  const personalTotalReferrals = personalReferrals?.length ?? 0;
  const personalUnpaidCommissions = personalReferrals?.filter(r => r.status === 'unpaid').reduce((sum, r) => sum + r.commission, 0) ?? 0;
  const adminPersonalTotalSaleValue = personalReferrals?.reduce((sum, r) => sum + (r.commission / 0.70), 0) ?? 0;
  
  const recentReferrals = personalReferrals
    ?.sort((a, b) => b.date.toMillis() - a.date.toMillis())
    .slice(0, 5) ?? [];

  // --- Platform-wide Stats Calculations (for Admin) ---
  const totalAffiliatePayouts = allReferrals?.reduce((sum, r) => sum + r.commission, 0) ?? 0;
  const platformRevenue = totalAffiliatePayouts * (30 / 70);
  const platformTotalReferrals = allReferrals?.length ?? 0;
  const platformUnpaidCommissions = allReferrals?.filter(r => r.status === 'unpaid').reduce((sum, r) => sum + r.commission, 0) ?? 0;

  // --- Determine which values to display based on admin status ---
  const totalEarningsValue = isAdmin ? adminPersonalTotalSaleValue : personalTotalCommission;
  const totalReferralsValue = isAdmin ? platformTotalReferrals : personalTotalReferrals;
  const unpaidCommissionsValue = isAdmin ? platformUnpaidCommissions : personalUnpaidCommissions;
  
  const totalEarningsDescription = isAdmin ? "Gross value of sales you personally referred (100%)." : "Your 70% base commission from all-time sales.";
  const totalReferralsDescription = isAdmin ? "Total referrals across the platform." : "Users who signed up with your link.";
  const totalSalesDescription = isAdmin ? "Total initial sales across the platform." : "Total initial sales from your referrals.";
  const unpaidCommissionsDescription = isAdmin ? "Total unpaid commissions across the platform." : "Your 70% share to be paid out tomorrow.";


  const trialEndDate = userData?.subscription?.trialEndDate?.toDate();
  const isTrialActive = trialEndDate && trialEndDate > new Date();


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
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's a summary of your affiliate activity.</p>
      </div>

      {isTrialActive && (
        <Alert className="border-accent/50 bg-accent/5">
          <Info className="h-4 w-4 text-accent" />
          <AlertTitle className="text-accent">You're on a Trial!</AlertTitle>
          <AlertDescription>
            Your 3-day free trial is active and will end on {format(trialEndDate, 'PP')}. Start referring to keep the momentum going!
          </AlertDescription>
        </Alert>
      )}

      {/* Conditionally render the admin-only revenue card */}
      {isAdmin && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Admin Overview</CardTitle>
            <CardDescription>Platform-wide revenue summary.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
                <StatCard
                  title="Your Revenue (Platform Cut)"
                  value={`$${platformRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
                  description="The 30% platform cut from every sale, credited to you."
                />
                <StatCard
                  title="Total Affiliate Payouts"
                  value={`$${totalAffiliatePayouts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
                  description="Total 70% commissions paid to all affiliates."
                />
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Earnings"
          value={`$${totalEarningsValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
          description={totalEarningsDescription}
        />
        <StatCard
          title="Total Referrals"
          value={`+${totalReferralsValue}`}
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          description={totalReferralsDescription}
        />
        <StatCard
          title="Total Sales"
          value={`+${totalReferralsValue}`}
          icon={<BarChart className="h-5 w-5 text-muted-foreground" />}
          description={totalSalesDescription}
        />
         <StatCard
          title="Unpaid Commissions"
          value={`$${unpaidCommissionsValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-5 w-5 text-green-500" />}
          description={unpaidCommissionsDescription}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
            <CardDescription>A quick look at your latest sign-ups.</CardDescription>
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

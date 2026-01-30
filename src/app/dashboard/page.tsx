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

  // --- Personal Data Fetching (for all users, including admin) ---
  const personalReferralsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'referrals');
  }, [user, firestore]);
  const { data: personalReferrals, isLoading: personalReferralsLoading } = useCollection<Referral>(personalReferralsQuery);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  // --- Admin-Only Data Fetching ---
  const allReferralsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null; // Only fetch if admin
    return collectionGroup(firestore, 'referrals');
  }, [isAdmin, firestore]);
  const { data: allReferrals, isLoading: allReferralsLoading } = useCollection<Referral>(allReferralsQuery);
  
  const initialLoading = isUserLoading || isAdminLoading;
  const isPlatformDataEmpty = isAdmin && !allReferralsLoading && allReferrals?.length === 0;

  // --- Platform-Wide Stats (for Admins) ---
  const { platformRevenue, totalAffiliatePayouts, totalPlatformReferrals, totalGrossSales } = useMemo(() => {
    if (!isAdmin || !allReferrals || allReferrals.length === 0) {
      return { platformRevenue: 0, totalAffiliatePayouts: 0, totalPlatformReferrals: 0, totalGrossSales: 0 };
    }

    try {
      // Calculate gross sales by deriving it from the commission, which is more reliable if grossSale field is missing.
      const grossSales = allReferrals.reduce((sum, r) => {
          const commission = typeof r.commission === 'number' ? r.commission : 0;
          // Assume a 70% commission rate to reverse-calculate the sale amount.
          return sum + (commission / 0.70);
      }, 0);
      const payouts = allReferrals.reduce((sum, r) => sum + (typeof r.commission === 'number' ? r.commission : 0), 0);
      const companyRevenue = grossSales - payouts;

      return {
        platformRevenue: companyRevenue,
        totalAffiliatePayouts: payouts,
        totalPlatformReferrals: allReferrals.length,
        totalGrossSales: grossSales,
      };
    } catch (e) {
      console.error("Error calculating platform stats:", e);
      return { platformRevenue: 0, totalAffiliatePayouts: 0, totalPlatformReferrals: 0, totalGrossSales: 0 };
    }
  }, [allReferrals, isAdmin]);

  const recentAllReferrals = useMemo(() => 
      allReferrals?.sort((a, b) => b.date.toMillis() - a.date.toMillis()).slice(0, 5) ?? [],
      [allReferrals]
  );

  // --- Personal Stats (for the logged-in user, admin or not) ---
   const { personalTotalCommission, personalTotalReferrals, personalUnpaidCommissions, personalGrossSalesValue } = useMemo(() => {
      if (!personalReferrals || personalReferrals.length === 0) {
          return { personalTotalCommission: 0, personalTotalReferrals: 0, personalUnpaidCommissions: 0, personalGrossSalesValue: 0 };
      }

      const totalCommission = personalReferrals.reduce((sum, r) => sum + r.commission, 0);
      const unpaidCommissions = personalReferrals.filter(r => r.status === 'unpaid').reduce((sum, r) => sum + r.commission, 0);
      
      // Reverted Logic: Calculate gross sales from commission to fix display bug.
      const grossSales = personalReferrals.reduce((sum, r) => {
          const commission = typeof r.commission === 'number' ? r.commission : 0;
          // Assume a 70% commission rate to reverse-calculate the sale amount.
          return sum + (commission / 0.70);
      }, 0);

      return {
          personalTotalCommission: totalCommission,
          personalTotalReferrals: personalReferrals.length,
          personalUnpaidCommissions: unpaidCommissions,
          personalGrossSalesValue: grossSales,
      };
  }, [personalReferrals]);

  const recentPersonalReferrals = personalReferrals?.sort((a, b) => b.date.toMillis() - a.date.toMillis()).slice(0, 5) ?? [];
  const trialEndDate = userData?.subscription?.trialEndDate?.toDate();
  const isTrialActive = trialEndDate && trialEndDate > new Date();

  if (initialLoading) {
      return (
          <div className="flex justify-center items-center h-full p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="space-y-8">
        {/* ======== ADMIN-ONLY SECTION ======== */}
        {isAdmin && (
            <div className="space-y-8">
                {isPlatformDataEmpty ? (
                     <Card>
                        <CardHeader>
                            <CardTitle>Admin Dashboard is Ready!</CardTitle>
                            <CardDescription>The system is working, but there's no platform-wide data to show yet.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-muted-foreground py-10 px-4">
                                <Users className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-semibold text-foreground">Waiting for the First Referral</h3>
                                <p className="mt-1 text-sm">
                                    To see your dashboard populate with data, you need to simulate a customer referral.
                                </p>
                                <div className="mt-4 text-sm text-left bg-secondary/50 p-4 rounded-lg max-w-lg mx-auto">
                                    <p className="font-semibold">How to test the referral flow:</p>
                                    <ol className="list-decimal list-inside mt-2 space-y-1">
                                        <li>Go to your <Link href="/dashboard/settings" className="text-primary underline">Settings</Link> page and copy your affiliate link.</li>
                                        <li>Open that link in a new <strong>incognito browser window</strong>.</li>
                                        <li>Sign up for a new account with a different email address and choose a plan.</li>
                                        <li>Once the new user is created, this dashboard will update with the referral data.</li>
                                    </ol>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div>
                            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                            <p className="text-muted-foreground">Platform-wide affiliate activity summary.</p>
                        </div>

                        <Alert className="bg-primary/5 border-primary/20 text-primary-foreground">
                            <Info className="h-4 w-4 text-primary" />
                            <AlertTitle className="font-bold text-primary">You are the Platform Owner</AlertTitle>
                            <AlertDescription className="text-foreground/80">
                                This Admin section shows your <strong>30% revenue share</strong> from <strong>all sales across the entire platform</strong>. The "Your Affiliate Dashboard" section below shows stats for your personal referrals only.
                            </AlertDescription>
                        </Alert>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="Platform Revenue"
                                value={`$${platformRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                icon={<TrendingUp />}
                                description="Your company's 30% share of revenue from all sales."
                            />
                            <StatCard
                                title="Total Affiliate Payouts"
                                value={`$${totalAffiliatePayouts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                icon={<DollarSign />}
                                description="Total 70% commissions generated by all affiliates."
                            />
                            <StatCard
                                title="Platform-Wide Referrals"
                                value={`+${totalPlatformReferrals}`}
                                icon={<Users />}
                                description="Total users referred across the entire platform."
                            />
                            <StatCard
                                title="Total Gross Sales"
                                value={`$${totalGrossSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                icon={<BarChart />}
                                description="Gross value of all sales on the platform."
                            />
                        </div>
                         <Card>
                            <CardHeader>
                                <CardTitle>Recent Platform-Wide Referrals</CardTitle>
                                <CardDescription>The latest sign-ups from all affiliates.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {allReferrals && allReferrals.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Referred User</TableHead>
                                                <TableHead>Affiliate ID</TableHead>
                                                <TableHead>Plan</TableHead>
                                                <TableHead>Initial Commission</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentAllReferrals.map((referral) => (
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
                                    <div className="flex justify-center items-center h-40">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p className="ml-4">Loading platform data...</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
                <hr className="my-8 border-dashed" />
            </div>
        )}

        {/* ======== PERSONAL DASHBOARD SECTION (for all users) ======== */}
        <div>
            <h1 className="text-3xl font-bold font-headline">Your Affiliate Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's a summary of your personal affiliate activity.</p>
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
                value={`$${personalTotalCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<DollarSign />}
                description="Your 70% commission from your direct sales."
            />
            <StatCard
                title="Your Total Referrals"
                value={`+${personalTotalReferrals}`}
                icon={<Users />}
                description="Users who signed up for a plan directly using your link."
            />
            <StatCard
                title="Your Gross Sales Value"
                value={`$${personalGrossSalesValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<BarChart />}
                description="Gross value of sales made from your direct referrals."
            />
            <StatCard
                title="Your Unpaid Commissions"
                value={`$${personalUnpaidCommissions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<DollarSign className="text-green-500" />}
                description="Your 70% share from direct sales, to be paid out."
            />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Your Recent Referrals</CardTitle>
                    <CardDescription>A quick look at the latest sign-ups from your link.</CardDescription>
                </CardHeader>
                <CardContent>
                    {personalReferrals && personalReferrals.length > 0 ? (
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
                                {recentPersonalReferrals.map((referral) => (
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

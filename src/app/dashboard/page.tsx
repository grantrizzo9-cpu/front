
'use client';

import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { DollarSign, Users, BrainCircuit, ArrowRight, Loader2, TrendingUp, Info, UserCheck, UserPlus, AlertCircle, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import type { Referral, User as UserType } from "@/lib/types";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, collectionGroup, doc } from "firebase/firestore";
import { useAdmin } from "@/hooks/use-admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMemo } from "react";
import { subscriptionTiers } from "@/lib/data";
import { Progress } from "@/components/ui/progress";

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
  const allUsersQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null; // Only fetch if admin
    return collection(firestore, 'users');
  }, [isAdmin, firestore]);
  const { data: allUsers, isLoading: allUsersLoading } = useCollection<UserType>(allUsersQuery);
  
  const allReferralsQuery = useMemoFirebase(() => {
    if (!isAdmin || !firestore) return null; // Only fetch if admin
    return collectionGroup(firestore, 'referrals');
  }, [isAdmin, firestore]);
  const { data: allReferrals, isLoading: allReferralsLoading } = useCollection<Referral>(allReferralsQuery);
  
  const initialLoading = isUserLoading || isAdminLoading || isUserDataLoading;
  const isPlatformDataEmpty = isAdmin && !allReferralsLoading && allReferrals?.length === 0;

  // --- Platform-Wide Stats (for Admins) ---
  const { platformRevenue, totalAffiliatePayouts, totalPlatformReferrals, totalGrossSales, totalUsers, totalAffiliates, pendingActivations } = useMemo(() => {
    if (!isAdmin) {
      return { platformRevenue: 0, totalAffiliatePayouts: 0, totalPlatformReferrals: 0, totalGrossSales: 0, totalUsers: 0, totalAffiliates: 0, pendingActivations: 0 };
    }

    const usersCount = allUsers?.length ?? 0;
    const affiliatesCount = allUsers?.filter(u => u.isAffiliate).length ?? 0;

    if (!allReferrals || allReferrals.length === 0) {
      return { platformRevenue: 0, totalAffiliatePayouts: 0, totalPlatformReferrals: 0, totalGrossSales: 0, totalUsers: usersCount, totalAffiliates: affiliatesCount, pendingActivations: 0 };
    }

    try {
      const pending = allReferrals.filter(r => r.activationStatus === 'pending').length;
      const activatedReferrals = allReferrals.filter(r => r.activationStatus === 'activated');
      
      const grossSales = activatedReferrals.reduce((sum, r) => {
          const tier = subscriptionTiers.find(t => t.name === r.planPurchased);
          return sum + (tier?.price || 0);
      }, 0);
      const payouts = activatedReferrals.reduce((sum, r) => sum + (r.commission || 0), 0);
      const companyRevenue = grossSales - payouts;

      return {
        platformRevenue: companyRevenue,
        totalAffiliatePayouts: payouts,
        totalPlatformReferrals: allReferrals.length,
        totalGrossSales: grossSales,
        totalUsers: usersCount,
        totalAffiliates: affiliatesCount,
        pendingActivations: pending,
      };
    } catch (e) {
      console.error("Error calculating platform stats:", e);
      return { platformRevenue: 0, totalAffiliatePayouts: 0, totalPlatformReferrals: 0, totalGrossSales: 0, totalUsers: usersCount, totalAffiliates: affiliatesCount, pendingActivations: 0 };
    }
  }, [allReferrals, allUsers, isAdmin]);

  const recentAllReferrals = useMemo(() => 
      allReferrals?.sort((a, b) => (b.date?.toMillis() ?? 0) - (a.date?.toMillis() ?? 0)).slice(0, 5) ?? [],
      [allReferrals]
  );

  // --- Personal Stats (for the logged-in user, admin or not) ---
   const { personalTotalCommission, personalTotalReferrals, personalUnpaidCommissions, personalPendingActivations } = useMemo(() => {
      if (!personalReferrals || personalReferrals.length === 0) {
          return { personalTotalCommission: 0, personalTotalReferrals: 0, personalUnpaidCommissions: 0, personalPendingActivations: 0 };
      }

      const totalCommission = personalReferrals.reduce((sum, r) => sum + (r.commission || 0), 0);
      const unpaidCommissions = personalReferrals.filter(r => r.status === 'unpaid').reduce((sum, r) => sum + (r.commission || 0), 0);
      const pending = personalReferrals.filter(r => r.activationStatus === 'pending').length;
      
      return {
          personalTotalCommission: totalCommission,
          personalTotalReferrals: personalReferrals.length,
          personalUnpaidCommissions: unpaidCommissions,
          personalPendingActivations: pending,
      };
  }, [personalReferrals]);

  const recentPersonalReferrals = personalReferrals?.sort((a, b) => (b.date?.toMillis() ?? 0) - (a.date?.toMillis() ?? 0)).slice(0, 5) ?? [];
  
  const isSubscriptionInactive = userData?.subscription?.status === 'inactive';
  const trialEndDate = userData?.subscription?.trialEndDate?.toDate();
  const isTrialActive = userData?.subscription?.status === 'active' && trialEndDate && trialEndDate > new Date();

  const userTier = useMemo(() => subscriptionTiers.find(t => t.id === userData?.subscription?.tierId), [userData]);

  const { totalStorage, usedStorage, usagePercentage } = useMemo(() => {
    if (!userTier) return { totalStorage: 0, usedStorage: 0, usagePercentage: 0 };
    
    const parseStorage = (storageString: string | undefined): number => {
      if (!storageString) return 0;
      const match = storageString.match(/(\d+\.?\d*)\s*(GB|TB)/i);
      if (!match) return 0;
      let value = parseFloat(match[1]);
      const unit = match[2].toUpperCase();
      if (unit === 'TB') {
          value *= 1000; // Convert TB to GB
      }
      return value;
    };
    
    const storageFeature = userTier.features.find(f => f.includes('GB') || f.includes('TB'));
    const total = storageFeature ? parseStorage(storageFeature) : 0;
    const used = 4.72; // Mocked value
    const percentage = total > 0 ? (used / total) * 100 : 0;

    return { totalStorage: total, usedStorage: used, usagePercentage: percentage };
  }, [userTier]);

  const referralDescription = useMemo(() => {
    if (personalTotalReferrals === 0) {
        return "Share your link to get your first referral.";
    }
    if (personalPendingActivations > 0) {
        return `${personalPendingActivations} pending activation${personalPendingActivations > 1 ? 's' : ''}.`;
    }
    return "All referrals are activated.";
  }, [personalTotalReferrals, personalPendingActivations]);

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
                               This Admin section shows platform-wide revenue. The first payment from every new user is a 100% platform fee. Commissions are earned on subsequent recurring payments.
                            </AlertDescription>
                        </Alert>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            <StatCard
                                title="Platform Revenue"
                                value={`$${platformRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                icon={<TrendingUp />}
                                description="Platform profit after affiliate payouts are accounted for."
                            />
                             <StatCard
                                title="Total Gross Sales"
                                value={`$${totalGrossSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                icon={<TrendingUp />}
                                description="Total value of all sales before affiliate payouts."
                            />
                             <StatCard
                                title="Total Affiliate Payouts"
                                value={`$${totalAffiliatePayouts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                icon={<DollarSign />}
                                description="Total commissions paid or due to all affiliates."
                            />
                            <StatCard
                                title="Platform-Wide Referrals"
                                value={`+${totalPlatformReferrals}`}
                                icon={<UserPlus />}
                                description="Total users referred across the entire platform."
                            />
                            <StatCard
                                title="Pending Activations"
                                value={`${pendingActivations}`}
                                icon={<AlertCircle />}
                                description="Users who signed up but have not yet paid."
                            />
                            <StatCard
                                title="Total Platform Users"
                                value={`${totalUsers}`}
                                icon={<Users />}
                                description="Total number of user accounts on the platform."
                            />
                            <StatCard
                                title="Total Active Affiliates"
                                value={`${totalAffiliates}`}
                                icon={<UserCheck />}
                                description="Total users who are active affiliates."
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
                                                <TableHead>Email</TableHead>
                                                <TableHead>Affiliate</TableHead>
                                                <TableHead>Plan</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentAllReferrals.map((referral) => (
                                                <TableRow key={referral.id}>
                                                    <TableCell className="font-medium">{referral.referredUserUsername}</TableCell>
                                                    <TableCell>{referral.referredUserEmail}</TableCell>
                                                    <TableCell className="font-mono text-xs">{referral.affiliateId}</TableCell>
                                                    <TableCell>{referral.planPurchased}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={referral.activationStatus === 'activated' ? 'secondary' : 'default'} className={referral.activationStatus === 'activated' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}>
                                                            {referral.activationStatus}
                                                        </Badge>
                                                    </TableCell>
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

        {isSubscriptionInactive && !isAdmin && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Your Account is Inactive!</AlertTitle>
                <AlertDescription>
                    You must pay the one-time activation fee to start your trial and get access to all tools.
                    <Button asChild size="sm" className="ml-4">
                        <Link href={`/dashboard/upgrade?plan=${userData?.subscription?.tierId || 'starter'}`}>Activate Your Plan</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        )}

        {isTrialActive && !isAdmin && (
            <Alert className="border-accent/50 bg-accent/5">
                <Info className="h-4 w-4 text-accent" />
                <AlertTitle className="text-accent">You're on a Trial!</AlertTitle>
                <AlertDescription>
                    Your 3-day trial will end on {trialEndDate ? format(trialEndDate, 'PP') : '...'} Start referring to keep the momentum going!
                </AlertDescription>
            </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Your Total Earnings"
                value={`$${personalTotalCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<DollarSign />}
                description="Your commission from recurring sales."
            />
            <StatCard
                title="Your Total Referrals"
                value={`+${personalTotalReferrals}`}
                icon={<Users />}
                description={referralDescription}
            />
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
                    <HardDrive className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalStorage > 0 ? `${totalStorage} GB` : 'N/A'}</div>
                    <p className="text-xs text-muted-foreground">
                        {userTier?.name} Plan
                    </p>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 pt-0">
                    <Progress value={usagePercentage} aria-label={`${usagePercentage.toFixed(0)}% used`} />
                    <p className="text-xs text-muted-foreground">{usedStorage.toFixed(2)} GB of {totalStorage} GB used</p>
                </CardFooter>
            </Card>
            <StatCard
                title="Your Unpaid Commissions"
                value={`$${personalUnpaidCommissions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<DollarSign className="text-green-500" />}
                description="Your share from recurring sales, to be paid out."
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
                                    <TableHead>Activation</TableHead>
                                    <TableHead className="text-right">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentPersonalReferrals.map((referral) => (
                                    <TableRow key={referral.id}>
                                        <TableCell className="font-medium">{referral.referredUserUsername}</TableCell>
                                        <TableCell>{referral.planPurchased}</TableCell>
                                        <TableCell>
                                            <Badge variant={referral.activationStatus === 'activated' ? 'default' : 'secondary'} className={referral.activationStatus === 'activated' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                                                {referral.activationStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{referral.date ? format(referral.date.toDate(), 'PP') : 'N/A'}</TableCell>
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

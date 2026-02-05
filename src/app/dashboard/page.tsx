
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
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
                        <CardContent><Skeleton className="h-8 w-32" /></CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid gap-8 md:grid-cols-2">
                <Card><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
            </div>
        </div>
    );
}

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { isPlatformOwner, isLoading: isAdminLoading } = useAdmin();

  // --- Personal Data Fetching ---
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
    if (!isPlatformOwner || !firestore) return null;
    return collection(firestore, 'users');
  }, [isPlatformOwner, firestore]);
  const { data: allUsers, isLoading: allUsersLoading } = useCollection<UserType>(allUsersQuery);
  
  const allReferralsQuery = useMemoFirebase(() => {
    if (!isPlatformOwner || !firestore) return null;
    return collectionGroup(firestore, 'referrals');
  }, [isPlatformOwner, firestore]);
  const { data: allReferrals, isLoading: allReferralsLoading } = useCollection<Referral>(allReferralsQuery);
  
  const isGlobalLoading = isUserLoading || isAdminLoading;

  // --- Platform-Wide Stats (for Admins) ---
  const platformStats = useMemo(() => {
    if (!isPlatformOwner || !allUsers || !allReferrals) {
      return null;
    }

    const usersCount = allUsers.length;
    const affiliatesCount = allUsers.filter(u => u.isAffiliate).length;
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
      recentAllReferrals: allReferrals.sort((a, b) => (b.date?.toMillis() ?? 0) - (a.date?.toMillis() ?? 0)).slice(0, 5)
    };
  }, [allReferrals, allUsers, isPlatformOwner]);

  // --- Personal Stats ---
   const personalStats = useMemo(() => {
      if (!personalReferrals) return null;

      const totalCommission = personalReferrals.reduce((sum, r) => sum + (r.commission || 0), 0);
      const unpaidCommissions = personalReferrals.filter(r => r.status === 'unpaid').reduce((sum, r) => sum + (r.commission || 0), 0);
      const pending = personalReferrals.filter(r => r.activationStatus === 'pending').length;
      
      return {
          personalTotalCommission: totalCommission,
          personalTotalReferrals: personalReferrals.length,
          personalUnpaidCommissions: unpaidCommissions,
          personalPendingActivations: pending,
          recentPersonalReferrals: personalReferrals.sort((a, b) => (b.date?.toMillis() ?? 0) - (a.date?.toMillis() ?? 0)).slice(0, 5)
      };
  }, [personalReferrals]);

  const userTier = useMemo(() => subscriptionTiers.find(t => t.id === userData?.subscription?.tierId), [userData]);

  const storageStats = useMemo(() => {
    if (!userTier) return { totalStorage: 0, usedStorage: 0, usagePercentage: 0 };
    const parseStorage = (s: string | undefined) => {
      const m = s?.match(/(\d+\.?\d*)\s*(GB|TB)/i);
      if (!m) return 0;
      let v = parseFloat(m[1]);
      return m[2].toUpperCase() === 'TB' ? v * 1000 : v;
    };
    const total = parseStorage(userTier.features.find(f => f.includes('GB') || f.includes('TB')));
    const used = 4.72; // Mocked
    return { totalStorage: total, usedStorage: used, usagePercentage: total > 0 ? (used / total) * 100 : 0 };
  }, [userTier]);

  if (isGlobalLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        {/* ======== ADMIN-ONLY SECTION ======== */}
        {isPlatformOwner && (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Platform-wide affiliate activity summary.</p>
                </div>

                {!platformStats ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            <StatCard
                                title="Platform Revenue"
                                value={`$${platformStats.platformRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                icon={<TrendingUp />}
                            />
                             <StatCard
                                title="Total Gross Sales"
                                value={`$${platformStats.totalGrossSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                icon={<TrendingUp />}
                            />
                             <StatCard
                                title="Total Affiliate Payouts"
                                value={`$${platformStats.totalAffiliatePayouts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                icon={<DollarSign />}
                            />
                            <StatCard
                                title="Platform-Wide Referrals"
                                value={`+${platformStats.totalPlatformReferrals}`}
                                icon={<UserPlus />}
                            />
                        </div>
                         <Card>
                            <CardHeader>
                                <CardTitle>Recent Platform-Wide Referrals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {platformStats.recentAllReferrals.map((referral) => (
                                            <TableRow key={referral.id}>
                                                <TableCell className="font-medium">{referral.referredUserUsername}</TableCell>
                                                <TableCell>{referral.referredUserEmail}</TableCell>
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
                            </CardContent>
                        </Card>
                    </>
                )}
                <hr className="my-8 border-dashed" />
            </div>
        )}

        {/* ======== PERSONAL DASHBOARD SECTION ======== */}
        <div>
            <h1 className="text-3xl font-bold font-headline">Your Affiliate Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your personal progress.</p>
        </div>

        {userData?.subscription?.status === 'inactive' && !isPlatformOwner && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>
                    Activate your plan to unlock all tools.
                    <Button asChild size="sm" className="ml-4">
                        <Link href={`/dashboard/upgrade?plan=${userData?.subscription?.tierId || 'starter'}`}>Activate Now</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {personalStats ? (
                <>
                    <StatCard
                        title="Total Earnings"
                        value={`$${personalStats.personalTotalCommission.toFixed(2)}`}
                        icon={<DollarSign />}
                    />
                    <StatCard
                        title="Total Referrals"
                        value={`+${personalStats.personalTotalReferrals}`}
                        icon={<Users />}
                    />
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
                            <HardDrive className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{storageStats.totalStorage > 0 ? `${storageStats.totalStorage} GB` : 'N/A'}</div>
                            <Progress value={storageStats.usagePercentage} className="mt-2" />
                        </CardContent>
                    </Card>
                    <StatCard
                        title="Unpaid Commissions"
                        value={`$${personalStats.personalUnpaidCommissions.toFixed(2)}`}
                        icon={<DollarSign className="text-green-500" />}
                    />
                </>
            ) : (
                [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
            )}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                    {personalStats ? (
                        personalStats.recentPersonalReferrals.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {personalStats.recentPersonalReferrals.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell className="font-medium">{r.referredUserUsername}</TableCell>
                                            <TableCell>
                                                <Badge variant={r.activationStatus === 'activated' ? 'default' : 'secondary'} className={r.activationStatus === 'activated' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                                                    {r.activationStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{r.date ? format(r.date.toDate(), 'MMM d') : 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground">No referrals yet. Share your link!</div>
                        )
                    ) : (
                        <Skeleton className="h-40 w-full" />
                    )}
                </CardContent>
            </Card>

            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6 text-primary" />
                        AI Content Generator
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <p className="text-muted-foreground text-sm">Jumpstart your marketing by creating high-quality blog posts and ads in seconds.</p>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/dashboard/ai-tools">Open AI Tools <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}

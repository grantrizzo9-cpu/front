'use client';

import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { DollarSign, Users, BrainCircuit, ArrowRight, Loader2, TrendingUp, UserPlus, AlertCircle, HardDrive } from "lucide-react";
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

function StatSkeleton() {
    return <Skeleton className="h-24 w-full" />;
}

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { isPlatformOwner, isLoading: isAdminLoading } = useAdmin();

  // --- Personal Data Fetching ---
  const personalReferralsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'referrals');
  }, [user?.uid, firestore]);
  const { data: personalReferrals, isLoading: personalReferralsLoading } = useCollection<Referral>(personalReferralsQuery);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  // --- Admin-Only Data Fetching (Fires ONLY if owner) ---
  const allReferralsQuery = useMemoFirebase(() => {
    if (!isPlatformOwner || !firestore) return null;
    return collectionGroup(firestore, 'referrals');
  }, [isPlatformOwner, firestore]);
  const { data: allReferrals, isLoading: allReferralsLoading } = useCollection<Referral>(allReferralsQuery);
  
  // --- Stats Computation ---
  const platformStats = useMemo(() => {
    if (!isPlatformOwner || !allReferrals) return null;
    const activatedReferrals = allReferrals.filter(r => r.activationStatus === 'activated');
    const grossSales = activatedReferrals.reduce((sum, r) => {
        const tier = subscriptionTiers.find(t => t.name === r.planPurchased);
        return sum + (tier?.price || 0);
    }, 0);
    const payouts = activatedReferrals.reduce((sum, r) => sum + (r.commission || 0), 0);
    return {
      platformRevenue: grossSales - payouts,
      totalAffiliatePayouts: payouts,
      totalPlatformReferrals: allReferrals.length,
      recentAllReferrals: allReferrals.sort((a, b) => (b.date?.toMillis() ?? 0) - (a.date?.toMillis() ?? 0)).slice(0, 5)
    };
  }, [allReferrals, isPlatformOwner]);

   const personalStats = useMemo(() => {
      if (!personalReferrals) return null;
      return {
          totalCommission: personalReferrals.reduce((sum, r) => sum + (r.commission || 0), 0),
          totalReferrals: personalReferrals.length,
          unpaidCommissions: personalReferrals.filter(r => r.status === 'unpaid').reduce((sum, r) => sum + (r.commission || 0), 0),
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
    return { totalStorage: total, usedStorage: 4.72, usagePercentage: total > 0 ? (4.72 / total) * 100 : 0 };
  }, [userTier]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
        {/* ======== ADMIN SECTION ======== */}
        {!isAdminLoading && isPlatformOwner && (
            <div className="space-y-6 border-b border-dashed pb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Global Overview (High-Priority Sync)</p>
                </div>

                {!platformStats ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatSkeleton />
                        <StatSkeleton />
                        <StatSkeleton />
                        <StatSkeleton />
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard title="Revenue" value={`$${platformStats.platformRevenue.toFixed(2)}`} icon={<TrendingUp />} />
                        <StatCard title="Payouts" value={`$${platformStats.totalAffiliatePayouts.toFixed(2)}`} icon={<DollarSign />} />
                        <StatCard title="Total Referrals" value={`+${platformStats.totalPlatformReferrals}`} icon={<UserPlus />} />
                    </div>
                )}
            </div>
        )}

        {/* ======== PERSONAL SECTION ======== */}
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">My Dashboard</h1>
                <p className="text-muted-foreground">Your affiliate progress and usage.</p>
            </div>

            {!isUserDataLoading && userData?.subscription?.status === 'inactive' && !isPlatformOwner && (
                <Alert variant="destructive" className="animate-pulse">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Action Required: Inactive Plan</AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                        Activate your trial to unlock marketing tools and custom domains.
                        <Button asChild size="sm" variant="outline" className="ml-4 bg-white/10"><Link href={`/dashboard/upgrade?plan=${userData?.subscription?.tierId || 'starter'}`}>Activate Now</Link></Button>
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isUserLoading || isUserDataLoading || !personalStats ? (
                    <>
                        <StatSkeleton />
                        <StatSkeleton />
                        <StatSkeleton />
                        <StatSkeleton />
                    </>
                ) : (
                    <>
                        <StatCard title="Total Earnings" value={`$${personalStats.totalCommission.toFixed(2)}`} icon={<DollarSign />} />
                        <StatCard title="Total Referrals" value={`+${personalStats.totalReferrals}`} icon={<Users />} />
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
                                <HardDrive className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{storageStats.totalStorage > 0 ? `${storageStats.totalStorage} GB` : 'N/A'}</div>
                                <Progress value={storageStats.usagePercentage} className="mt-2 h-1.5" />
                            </CardContent>
                        </Card>
                        <StatCard title="Unpaid Payouts" value={`$${personalStats.unpaidCommissions.toFixed(2)}`} icon={<DollarSign className="text-green-500" />} />
                    </>
                )}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Recent Referrals</CardTitle></CardHeader>
                    <CardContent>
                        {personalReferralsLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : personalStats && personalStats.recentPersonalReferrals.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {personalStats.recentPersonalReferrals.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell className="font-medium">{r.referredUserUsername}</TableCell>
                                            <TableCell><Badge variant="outline" className={r.activationStatus === 'activated' ? 'border-green-500 text-green-700' : 'border-amber-500 text-amber-700'}>{r.activationStatus}</Badge></TableCell>
                                            <TableCell className="text-right">{r.date ? format(r.date.toDate(), 'MMM d') : 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                                <p>No referrals yet.</p>
                                <Button asChild variant="link" size="sm"><Link href="/dashboard/settings">Get Referral Link</Link></Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20 flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-primary" />AI Content Studio</CardTitle>
                        <CardDescription>Generate ads and blog posts in seconds.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-muted-foreground text-sm">Your subscription includes high-performance AI tools to help you scale your affiliate business faster.</p>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button asChild className="w-full shadow-lg"><Link href="/dashboard/website">Launch AI Suite <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  );
}

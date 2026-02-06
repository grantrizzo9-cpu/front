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
import { collection, collectionGroup, doc, query, orderBy, limit } from "firebase/firestore";
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

  const recentReferralsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, 'users', user.uid, 'referrals'),
        orderBy('date', 'desc'),
        limit(5)
    );
  }, [user?.uid, firestore]);
  const { data: recentReferrals, isLoading: recentReferralsLoading } = useCollection<Referral>(recentReferralsQuery);

  const allPersonalReferralsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'referrals');
  }, [user?.uid, firestore]);
  const { data: allPersonalReferrals } = useCollection<Referral>(allPersonalReferralsQuery);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  const allPlatformReferralsQuery = useMemoFirebase(() => {
    if (!isPlatformOwner || !firestore) return null;
    return collectionGroup(firestore, 'referrals');
  }, [isPlatformOwner, firestore]);
  const { data: allPlatformReferrals, isLoading: allPlatformReferralsLoading } = useCollection<Referral>(allPlatformReferralsQuery);
  
  const platformStats = useMemo(() => {
    if (!isPlatformOwner || !allPlatformReferrals) return null;
    const activatedReferrals = allPlatformReferrals.filter(r => r.activationStatus === 'activated');
    const grossSales = activatedReferrals.reduce((sum, r) => {
        const tier = subscriptionTiers.find(t => t.name === r.planPurchased);
        return sum + (tier?.price || 0);
    }, 0);
    const payouts = activatedReferrals.reduce((sum, r) => sum + (r.commission || 0), 0);
    return {
      platformRevenue: grossSales - payouts,
      totalAffiliatePayouts: payouts,
      totalPlatformReferrals: allPlatformReferrals.length,
    };
  }, [allPlatformReferrals, isPlatformOwner]);

   const personalStats = useMemo(() => {
      if (!allPersonalReferrals) return null;
      return {
          totalCommission: allPersonalReferrals.reduce((sum, r) => sum + (r.commission || 0), 0),
          totalReferrals: allPersonalReferrals.length,
          unpaidCommissions: allPersonalReferrals.filter(r => r.status === 'unpaid').reduce((sum, r) => sum + (r.commission || 0), 0),
      };
  }, [allPersonalReferrals]);

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
        {!isAdminLoading && isPlatformOwner && (
            <div className="space-y-6 border-b border-dashed pb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline heading-red">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Global Platform Overview</p>
                </div>

                {allPlatformReferralsLoading || !platformStats ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <StatSkeleton />
                        <StatSkeleton />
                        <StatSkeleton />
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <StatCard title="Total Platform Revenue" value={`$${platformStats.platformRevenue.toFixed(2)}`} icon={<TrendingUp className="text-blue-600" />} />
                        <StatCard title="Total Payouts" value={`$${platformStats.totalAffiliatePayouts.toFixed(2)}`} icon={<DollarSign className="text-blue-600" />} />
                        <StatCard title="Active Referrals" value={`${platformStats.totalPlatformReferrals}`} icon={<UserPlus className="text-blue-600" />} />
                    </div>
                )}
            </div>
        )}

        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline heading-red">My Dashboard</h1>
                <p className="text-muted-foreground">Your affiliate progress and usage statistics.</p>
            </div>

            {!isUserDataLoading && userData?.subscription?.status === 'inactive' && !isPlatformOwner && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="font-bold">Action Required: Plan Inactive</AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                        Activate your trial to unlock the AI Content Studio and Custom Domains.
                        <Button asChild size="sm" className="ml-4 bg-red-600 hover:bg-red-700 text-white"><Link href={`/dashboard/upgrade?plan=${userData?.subscription?.tierId || 'starter'}`}>Activate Now</Link></Button>
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isUserLoading || !personalStats ? (
                    <>
                        <StatSkeleton />
                        <StatSkeleton />
                        <StatSkeleton />
                        <StatSkeleton />
                    </>
                ) : (
                    <>
                        <StatCard title="Total Earnings" value={`$${personalStats.totalCommission.toFixed(2)}`} icon={<DollarSign className="text-blue-600" />} />
                        <StatCard title="Total Referrals" value={`${personalStats.totalReferrals}`} icon={<Users className="text-blue-600" />} />
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
                                <HardDrive className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{storageStats.totalStorage > 0 ? `${storageStats.totalStorage} GB` : 'N/A'}</div>
                                <Progress value={storageStats.usagePercentage} className="mt-2 h-1.5 bg-slate-100" />
                            </CardContent>
                        </Card>
                        <StatCard title="Unpaid Commissions" value={`$${personalStats.unpaidCommissions.toFixed(2)}`} icon={<DollarSign className="text-green-600" />} />
                    </>
                )}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Recent Referrals</CardTitle></CardHeader>
                    <CardContent>
                        {recentReferralsLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : recentReferrals && recentReferrals.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentReferrals.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell className="font-medium">{r.referredUserUsername}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={r.activationStatus === 'activated' ? 'border-green-500 text-green-700 bg-green-50' : 'border-amber-500 text-amber-700 bg-amber-50'}>
                                                    {r.activationStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">{r.date ? format(r.date.toDate(), 'MMM d') : 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg bg-slate-50/50">
                                <p>No referrals yet.</p>
                                <Button asChild variant="link" size="sm" className="text-blue-600 font-bold"><Link href="/dashboard/settings">Get My Referral Link</Link></Button>
                            </div>
                        )}
                    </CardContent>
                    {recentReferrals && recentReferrals.length > 0 && (
                        <CardFooter>
                            <Button asChild variant="ghost" size="sm" className="w-full text-blue-600">
                                <Link href="/dashboard/referrals">View All Referrals <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                <Card className="bg-blue-50/50 border-blue-100 flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900"><BrainCircuit className="w-6 h-6 text-blue-600" />AI Content Studio</CardTitle>
                        <CardDescription className="text-blue-700">Generate high-converting ads and blog posts in seconds.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Your subscription includes access to high-performance AI models trained for affiliate marketing. Generate copy, images, and full landing pages to scale your income velocity.
                        </p>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"><Link href="/dashboard/website">Launch AI Suite <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  );
}
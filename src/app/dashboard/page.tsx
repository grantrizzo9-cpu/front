'use client';

import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { DollarSign, Users, BarChart, BrainCircuit, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import type { Referral, Commission } from "@/lib/types";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const commissionsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'commissions');
  }, [firestore, user]);

  const referralsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'referrals');
  }, [firestore, user]);

  const { data: commissions, isLoading: commissionsLoading } = useCollection<Commission>(commissionsRef);
  const { data: referrals, isLoading: referralsLoading } = useCollection<Referral>(referralsRef);

  const isLoading = isUserLoading || commissionsLoading || referralsLoading;

  const totalEarnings = commissions?.reduce((sum, c) => sum + c.amount, 0) ?? 0;
  const totalReferrals = referrals?.length ?? 0;
  const unpaidCommissions = commissions?.filter(c => c.status === 'unpaid').reduce((sum, c) => sum + c.amount, 0) ?? 0;

  const recentReferrals = referrals
    ?.sort((a, b) => b.date.toMillis() - a.date.toMillis())
    .slice(0, 5) ?? [];

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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Earnings"
          value={`$${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
          description="All-time earnings from commissions."
        />
        <StatCard
          title="Total Referrals"
          value={`+${totalReferrals}`}
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          description="Users who signed up with your link."
        />
        <StatCard
          title="Total Sales"
          value={`+${totalReferrals}`}
          icon={<BarChart className="h-5 w-5 text-muted-foreground" />}
          description="Total initial sales from your referrals."
        />
         <StatCard
          title="Unpaid Commissions"
          value={`$${unpaidCommissions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-5 w-5 text-muted-foreground text-green-500" />}
          description="To be paid out tomorrow."
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
                        <TableCell className="text-right">{format(referral.date.toDate(), 'MMM d, yyyy')}</TableCell>
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

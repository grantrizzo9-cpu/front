import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockReferrals } from "@/lib/data";
import { format } from "date-fns";
import { DollarSign, Users, BarChart, Badge } from "lucide-react";
import { Badge as BadgeComponent } from "@/components/ui/badge";

export default function DashboardPage() {
  // In a real app, these values would be fetched for the logged-in user.
  const totalEarnings = 5234.89;
  const totalReferrals = 128;
  const totalSales = 150; // Could be different from referrals if users upgrade
  const unpaidCommissions = 5.23;

  const recentReferrals = mockReferrals.slice(0, 5);

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
          value={`+${totalSales}`}
          icon={<BarChart className="h-5 w-5 text-muted-foreground" />}
          description="Total initial sales and upgrades."
        />
         <StatCard
          title="Unpaid Commissions"
          value={`$${unpaidCommissions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-5 w-5 text-muted-foreground text-green-500" />}
          description="To be paid out tomorrow."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>A quick look at your latest sign-ups.</CardDescription>
        </CardHeader>
        <CardContent>
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
                     <BadgeComponent variant={referral.status === 'paid' ? 'secondary' : 'default'} className={referral.status === 'unpaid' ? 'bg-green-500 text-white' : ''}>
                      {referral.status}
                    </BadgeComponent>
                  </TableCell>
                  <TableCell className="text-right">{format(referral.date, 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

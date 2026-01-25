import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockReferrals } from "@/lib/data";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function ReferralsPage() {
  // In a real app, this would be a paginated fetch from Firestore
  const referrals = mockReferrals;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Your Referrals</h1>
        <p className="text-muted-foreground">A complete list of every user you've referred.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Referrals</CardTitle>
          <CardDescription>
            You have a total of {referrals.length} referrals.
          </CardDescription>
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
              {referrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell className="font-medium">{referral.referredUserUsername}</TableCell>
                  <TableCell>{referral.planPurchased}</TableCell>
                  <TableCell>${referral.commission.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={referral.status === 'paid' ? 'secondary' : 'default'} className={referral.status === 'unpaid' ? 'bg-green-500 text-white hover:bg-green-600' : ''}>
                      {referral.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{format(referral.date, 'PPpp')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

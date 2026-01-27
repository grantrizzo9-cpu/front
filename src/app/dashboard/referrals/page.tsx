import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { Referral } from "@/lib/types";

export default function ReferralsPage() {
  // This will be replaced with a real-time fetch from Firestore
  const referrals: Referral[] = [];

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
          {referrals.length > 0 ? (
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
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <p>No referrals to show.</p>
              <p className="text-sm">Share your affiliate link to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
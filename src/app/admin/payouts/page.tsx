"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockAdminPayouts } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Send } from "lucide-react";

export default function AdminPayoutsPage() {
  const { toast } = useToast();

  // In a real app, this would be fetched from a server action that aggregates data
  const payouts = mockAdminPayouts;
  const totalPayoutAmount = payouts.reduce((sum, p) => sum + p.totalUnpaid, 0);

  const handleProcessPayouts = () => {
    // This would trigger a complex server action:
    // 1. For each affiliate, call the PayPal Payouts API.
    // 2. On success, update all their 'unpaid' commissions to 'paid'.
    // 3. Create a new payout record for each affiliate.
    // 4. Log the entire batch operation.
    toast({
      title: "Processing Payouts...",
      description: `Sending a total of $${totalPayoutAmount.toFixed(2)} to ${payouts.length} affiliates.`,
    });
    // After a delay to simulate processing:
    setTimeout(() => {
        toast({
            title: "Payouts Processed!",
            description: "All commissions have been paid and records updated.",
        });
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Manage Payouts</h1>
        <p className="text-muted-foreground">Review and process daily affiliate commission payouts.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Daily Payout Summary</CardTitle>
                <CardDescription>
                    Total of <span className="font-bold text-primary">${totalPayoutAmount.toFixed(2)}</span> to be paid to <span className="font-bold text-primary">{payouts.length}</span> affiliates.
                </CardDescription>
            </div>
            <Button size="lg" onClick={handleProcessPayouts} disabled={payouts.length === 0}>
                <Send className="mr-2 h-4 w-4" />
                Process All Payouts
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate</TableHead>
                <TableHead>PayPal Email</TableHead>
                <TableHead>Unpaid Commissions</TableHead>
                <TableHead className="text-right">Total Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.affiliateId}>
                  <TableCell className="font-medium">{payout.affiliateUsername}</TableCell>
                  <TableCell>{payout.paypalEmail}</TableCell>
                  <TableCell>{payout.unpaidCommissions}</TableCell>
                  <TableCell className="text-right font-semibold text-green-600">${payout.totalUnpaid.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

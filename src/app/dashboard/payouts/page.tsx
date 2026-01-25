import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockPayouts } from "@/lib/data";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PayoutsPage() {
  const payouts = mockPayouts;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Payout History</h1>
        <p className="text-muted-foreground">Your complete history of daily commission payouts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payouts</CardTitle>
          <CardDescription>
            All payouts are sent daily via PayPal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">PayPal Transaction ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium text-green-600">${payout.amount.toFixed(2)}</TableCell>
                  <TableCell>{format(payout.date, 'PPpp')}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    <Link href={`https://www.paypal.com/activity/payment/${payout.transactionId}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-end gap-2 hover:text-primary">
                        {payout.transactionId}
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

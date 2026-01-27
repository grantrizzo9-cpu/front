import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function DeprecatedPayoutsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Manage Payouts</h1>
        <p className="text-muted-foreground">This page is no longer in use.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            Page Deprecated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Affiliate commission payouts are now fully automated. This manual management page has been deprecated and is no longer needed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

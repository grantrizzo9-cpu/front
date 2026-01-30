
import { Suspense } from "react";
import { UpgradePageContent } from "./upgrade-content";
import { Skeleton } from "@/components/ui/skeleton";

function UpgradeLoadingSkeleton() {
    return (
        <div className="space-y-8">
            <Skeleton className="h-12 w-1/2" />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
}

// This is the new Server Component Page for the upgrade flow.
// It reads the configuration on the server and passes it to the client component.
export default function UpgradePage() {
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

    return (
        <Suspense fallback={<UpgradeLoadingSkeleton />}>
            <UpgradePageContent paypalClientId={paypalClientId} />
        </Suspense>
    );
}

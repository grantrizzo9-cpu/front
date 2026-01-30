import { Suspense } from 'react';
import { UpgradePageContent } from './upgrade-content';
import { Skeleton } from '@/components/ui/skeleton';

function UpgradeLoadingSkeleton() {
    return (
        <div className="space-y-8">
            <div className='space-y-2'>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
}

// Server Component
export default function UpgradePage() {
    // Reading the env var on the server is the most reliable method.
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

    return (
        <Suspense fallback={<UpgradeLoadingSkeleton />}>
            <UpgradePageContent paypalClientId={paypalClientId} />
        </Suspense>
    );
}

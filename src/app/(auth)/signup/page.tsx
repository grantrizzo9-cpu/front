'use client';
import { SignupFormWrapper } from './signup-form';
import { Suspense, useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function SignupLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export default function SignupPage() {
    const [isClient, setIsClient] = useState(false);

    // This hook ensures that the component is only rendered on the client side,
    // which is necessary to prevent hydration errors with browser-only scripts like PayPal.
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <SignupLoadingSkeleton />;
    }

    return (
        // Suspense is necessary because the child component uses `useSearchParams`.
        <Suspense fallback={<SignupLoadingSkeleton />}>
            <SignupFormWrapper />
        </Suspense>
    );
}

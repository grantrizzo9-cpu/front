'use client';

import { useState, useEffect } from 'react';
import { SignupForm } from './signup-form';
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

  // This useEffect hook ensures that the SignupForm, which contains
  // client-side specific code for PayPal, is only rendered on the client.
  // This prevents hydration errors that cause a blank page.
  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <SignupForm /> : <SignupLoadingSkeleton />;
}

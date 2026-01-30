
'use client';

import { Suspense } from 'react';
import { SignupForm } from './signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

function LoadingSignupForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Create Your Account</CardTitle>
                <CardDescription>Join now to become an affiliate and start earning.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function SignupPage() {
  // The <Suspense> wrapper is necessary because the SignupForm component
  // uses `useSearchParams` to read the plan from the URL.
  return (
    <Suspense fallback={<LoadingSignupForm />}>
      <SignupForm />
    </Suspense>
  );
}

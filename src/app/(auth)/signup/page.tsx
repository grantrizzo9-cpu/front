
import { Suspense } from 'react';
import { SignupForm } from './signup-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export default function SignupPage() {
  // The Suspense boundary is a critical part of the solution.
  // It allows the SignupForm component to safely use the useSearchParams hook on the client.
  return (
    <Suspense fallback={<SignupLoadingSkeleton />}>
      <SignupForm />
    </Suspense>
  );
}

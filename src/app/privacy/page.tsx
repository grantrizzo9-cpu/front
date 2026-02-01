import { Suspense } from 'react';
import { PrivacyContent } from './privacy-content';
import { Skeleton } from '@/components/ui/skeleton';

function Loading() {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container py-12 space-y-8">
            <div className="h-16 flex items-center border-b">
              <Skeleton className="h-8 w-40" />
              <div className="flex-grow" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="max-w-4xl mx-auto space-y-8">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <div className="space-y-6">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        </div>
      </div>
    );
}

export default function PrivacyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PrivacyContent />
    </Suspense>
  );
}

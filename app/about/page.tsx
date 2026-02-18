import { Suspense } from 'react';
import { AboutContent } from './about-content';
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
            <div className="flex flex-col items-center text-center py-20 md:py-32">
                <Skeleton className="h-12 w-3/4 mb-6" />
                <Skeleton className="h-6 w-1/2" />
            </div>
            <div className="grid gap-12 lg:grid-cols-2 items-center">
                <Skeleton className="h-80 lg:h-[500px] w-full" />
                <div className="space-y-6">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        </div>
      </div>
    );
}

export default function AboutPage() {
    return (
        <Suspense fallback={<Loading />}>
            <AboutContent />
        </Suspense>
    );
}

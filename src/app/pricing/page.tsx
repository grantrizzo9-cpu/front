import { Suspense } from 'react';
import { PricingContent } from './pricing-content';
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
            <div className="text-center py-20 md:py-32">
                <Skeleton className="h-12 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto mt-6" />
            </div>
             <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-4 rounded-lg border p-6">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-6 w-1/3" />
                         <div className="space-y-2 pt-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
                         </div>
                         <div className="pt-4">
                            <Skeleton className="h-10 w-full" />
                         </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={<Loading />}>
            <PricingContent />
        </Suspense>
    );
}

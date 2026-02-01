import { Suspense } from 'react';
import { ContactContent } from './contact-content';
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
            <div className="max-w-2xl mx-auto">
                <div className="space-y-2 mb-6">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
      </div>
    );
}

export default function ContactPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ContactContent />
        </Suspense>
    );
}

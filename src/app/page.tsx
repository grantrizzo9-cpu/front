import { Suspense } from 'react';
import { HomeContent } from './home-content';
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
              <Skeleton className="h-64 w-full" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <Skeleton className="h-64 w-full" />
          </div>
      </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  );
}

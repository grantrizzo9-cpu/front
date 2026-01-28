'use client';

import { Layers } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

export function Logo({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  const getHomeLink = () => {
    if (refCode) {
      return `/?ref=${refCode}`;
    }
    return '/';
  };

  return (
    <Link href={getHomeLink()} className={cn("flex items-center gap-2 text-foreground", className)}>
      <Layers className="h-7 w-7 text-primary" />
      <span className="text-xl font-bold font-headline">Affiliate AI Host</span>
    </Link>
  );
}

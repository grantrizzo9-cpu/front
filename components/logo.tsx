'use client';

import { Layers } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className, href = '/' }: { className?: string, href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 text-foreground", className)}>
      <Layers className="h-7 w-7 text-primary" />
      <span className="text-xl font-bold font-headline">Affiliate AI Host</span>
    </Link>
  );
}

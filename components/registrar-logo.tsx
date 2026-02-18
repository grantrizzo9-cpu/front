'use client';

import { Globe } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function RegistrarLogo({ className }: { className?: string }) {

  return (
    <Link 
      href="https://rizzosai.shopco.com" 
      target="_blank" 
      rel="noopener noreferrer"
      className={cn("flex items-center gap-2 text-foreground", className)}
    >
      <Globe className="h-6 w-6 text-muted-foreground" />
      <span className="text-lg font-bold font-headline">Host Pro AI</span>
    </Link>
  );
}

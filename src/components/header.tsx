"use client";

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function HeaderContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  const getLinkWithRef = (baseHref: string) => {
    if (baseHref.startsWith('/#')) return baseHref;
    if (!refCode) return baseHref;
    const url = new URL(baseHref, 'http://dummybase.com');
    url.searchParams.set('ref', refCode);
    return `${url.pathname}${url.search}`;
  };
  
  const navLinks = [
    { href: getLinkWithRef('/pricing'), label: 'Pricing' },
    { href: '/#features', label: 'Features' },
    { href: '/#insights', label: 'Insights' },
  ];

  const homeLink = getLinkWithRef('/');

  return (
    <div className="container flex h-20 items-center justify-between">
      <div className="flex items-center gap-8">
        <Logo href={homeLink} className="hover:opacity-80 transition-opacity" />
        <nav className="hidden md:flex items-center space-x-8 text-sm font-bold tracking-tight">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-primary uppercase"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center space-x-4">
          <Button variant="ghost" asChild className="font-bold text-muted-foreground hover:text-foreground">
            <Link href={getLinkWithRef('/login')}>Sign In</Link>
          </Button>
          <Button asChild className="rounded-xl font-bold px-6 shadow-xl shadow-primary/20">
            <Link href={getLinkWithRef('/pricing')}>Join Program</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-white/5 p-0">
              <div className="flex flex-col h-full p-8 pt-20 space-y-8">
                <Logo href={homeLink} />
                <nav className="flex flex-col space-y-6">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="text-2xl font-bold text-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="pt-8 space-y-4 border-t border-white/5">
                  <Button asChild className="w-full h-14 rounded-xl font-black text-lg">
                    <Link href={getLinkWithRef('/pricing')}>Get Started</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full h-14 rounded-xl font-bold text-lg">
                    <Link href={getLinkWithRef('/login')}>Log In</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl transition-all">
      <Suspense fallback={<div className="container h-20" />}>
        <HeaderContent />
      </Suspense>
    </header>
  );
}
"use client";

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { useSearchParams } from 'next/navigation';

export function Header() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  const getLinkWithRef = (baseHref: string) => {
    if (baseHref.startsWith('/#')) return baseHref;
    if (refCode) {
      return `${baseHref}?ref=${refCode}`;
    }
    return baseHref;
  };
  
  const navLinks = [
    { href: getLinkWithRef('/pricing'), label: 'Pricing' },
    { href: '/#features', label: 'Features' },
    { href: '/#faq', label: 'FAQ' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="grid gap-6 py-6">
                  <Logo />
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
        </div>
        <div className="flex w-full items-center justify-center md:justify-start">
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
                <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
                >
                {link.label}
                </Link>
            ))}
            </nav>
        </div>
        <div className="flex items-center justify-end space-x-2 sm:space-x-4">
          <Button variant="ghost" asChild>
            <Link href={getLinkWithRef('/login')}>Log In</Link>
          </Button>
          <Button asChild>
            <Link href={getLinkWithRef('/pricing')}>Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

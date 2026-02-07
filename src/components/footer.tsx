'use client';

import { Logo } from "@/components/logo";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

function FooterContent() {
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setIsHydrated(true);
    setYear(new Date().getFullYear());
  }, []);

  if (!isHydrated) return null;

  const refCode = searchParams.get('ref');

  const getLinkWithRef = (baseHref: string) => {
    if (!refCode) return baseHref;
    const [path, hash] = baseHref.split('#');
    const urlPath = path || '/';
    const url = new URL(urlPath, 'http://dummybase.com');
    url.searchParams.set('ref', refCode);
    return `${url.pathname}${url.search}${hash ? '#' + hash : ''}`;
  };

  const footerLinks = {
    platform: [
      { href: getLinkWithRef('/pricing'), label: 'Pricing' },
      { href: getLinkWithRef('/#features'), label: 'Features' },
      { href: getLinkWithRef('/#faq'), label: 'FAQ' },
      { href: getLinkWithRef('/login'), label: 'Login' },
    ],
    legal: [
      { href: getLinkWithRef('/terms'), label: 'Terms of Service' },
      { href: getLinkWithRef('/privacy'), label: 'Privacy Policy' },
      { href: getLinkWithRef('/disclaimer'), label: 'Earnings Disclaimer' },
    ],
    company: [
      { href: getLinkWithRef('/about'), label: 'About Us' },
      { href: getLinkWithRef('/contact'), label: 'Contact' },
    ]
  };

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="flex flex-col gap-4 pr-8">
          <Logo href={getLinkWithRef('/')} />
          <p className="text-muted-foreground text-sm">
            The future of affiliate marketing and web hosting, powered by AI.
          </p>
        </div>
        <div>
          <h4 className="font-headline font-semibold mb-4 text-foreground">Platform</h4>
          <ul className="space-y-2">
            {footerLinks.platform.map(link => (
              <li key={link.href}><Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">{link.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-headline font-semibold mb-4 text-foreground">Legal</h4>
          <ul className="space-y-2">
            {footerLinks.legal.map(link => (
              <li key={link.href}><Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">{link.label}</Link></li>
            ))}
          </ul>
        </div>
         <div>
          <h4 className="font-headline font-semibold mb-4 text-foreground">Company</h4>
          <ul className="space-y-2">
            {footerLinks.company.map(link => (
              <li key={link.href}><Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">{link.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          © {year || '2025'} Affiliate AI Host. All rights reserved. <span className="ml-2 opacity-30">v1.2.0</span>
        </p>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <Suspense fallback={<div className="container py-12 h-64" />}>
        <FooterContent />
      </Suspense>
    </footer>
  );
}
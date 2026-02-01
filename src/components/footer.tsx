
'use client';

import { Logo } from "@/components/logo";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function Footer() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  const getLinkWithRef = (baseHref: string) => {
    if (baseHref.startsWith('/#')) return baseHref;
    if (!refCode) {
      return baseHref;
    }
    // Use URL to handle existing search params robustly
    const url = new URL(baseHref, 'http://dummybase.com'); // A dummy base is required to construct the URL object
    url.searchParams.set('ref', refCode);
    return `${url.pathname}${url.search}`;
  };

  const footerLinks = {
    platform: [
      { href: getLinkWithRef('/pricing'), label: 'Pricing' },
      { href: '/#features', label: 'Features' },
      { href: '/#faq', label: 'FAQ' },
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
  }

  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4 pr-8">
            <Logo />
            <p className="text-muted-foreground text-sm">
              The future of affiliate marketing and web hosting, powered by AI.
            </p>
          </div>
          <div>
            <h4 className="font-headline font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map(link => (
                <li key={link.href}><Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">{link.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map(link => (
                <li key={link.href}><Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">{link.label}</Link></li>
              ))}
            </ul>
          </div>
           <div>
            <h4 className="font-headline font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map(link => (
                <li key={link.href}><Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">{link.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Affiliate AI Host. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

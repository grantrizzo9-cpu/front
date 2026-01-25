import { Logo } from "@/components/logo";
import Link from "next/link";

export function Footer() {
  const footerLinks = {
    platform: [
      { href: '/pricing', label: 'Pricing' },
      { href: '/#features', label: 'Features' },
      { href: '/#faq', label: 'FAQ' },
      { href: '/login', label: 'Login' },
    ],
    legal: [
      { href: '/terms', label: 'Terms of Service' },
      { href: '/privacy', label: 'Privacy Policy' },
    ],
    company: [
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
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

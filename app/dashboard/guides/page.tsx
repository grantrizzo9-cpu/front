
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookOpen, Download } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { User as UserType } from '@/lib/types';
import { doc } from 'firebase/firestore';


export type Guide = {
  title: string;
  level: 'starter' | 'plus' | 'pro' | 'business' | 'scale' | 'enterprise';
  content: string;
  imageId: string;
};

const allGuides: Guide[] = [
  {
    title: "The 5-Step Checklist to Launching a Profitable Affiliate Website in 24 Hours",
    level: "starter",
    imageId: "guide-checklist-launch",
    content: `
        <p>Welcome to your rapid-launch plan. This exclusive checklist is engineered to take you from zero to a live, income-ready affiliate website in a single day.</p>
        <h3>Step 1: Define Your Niche & Secure Your Domain</h3>
        <p>A great domain name is your brand. Choose wisely. Use the search tool on your Hosting page to find available domains.</p>
        <h3>Step 2: Connect Your Domain & Go Live</h3>
        <p>Follow our technical guides to point your domain to our servers using A records. This ensures a professional, fast connection.</p>
        <h3>Step 3: Create Your Core "Money" Pages</h3>
        <p>You need a trust-building 'About' page and a conversion-focused 'Review' page to start earning commissions.</p>
        <h3>Step 4: Your First Promotional Blitz</h3>
        <p>Use social media and personal outreach to drive your first wave of targeted traffic.</p>
        <h3>Step 5: Review, Track, & Optimize</h3>
        <p>Meticulously check your affiliate links and monitor your dashboard for real-time sign-ups.</p>
    `
  },
  {
    title: "Understanding Your Affiliate Link & Dashboard",
    level: "starter",
    imageId: "guide-dashboard-link",
    content: `
        <p>Mastering your link and dashboard is the first step to earning. Your link tracks your referrals, and your dashboard shows your progress.</p>
        <h3>Your Affiliate Link</h3>
        <p>Copy your unique link from the Settings page. It uses a lifetime cookie policy, meaning you get credit even if the user buys months later.</p>
        <h3>Your Dashboard</h3>
        <p>Track earnings, referrals, and storage usage in real-time. Use this data to optimize your marketing efforts.</p>
    `
  },
  {
    title: "Your First Affiliate Website: A Step-by-Step Guide",
    level: "starter",
    imageId: "guide-website-forwarding",
    content: `
      <p>Instead of old-fashioned domain forwarding, we use professional DNS A records to point your domain to our high-performance infrastructure.</p>
      <h3>Step 1: Get Your Affiliate Link</h3>
      <p>Save your unique ref link from the settings page.</p>
      <h3>Step 2: Purchase Your Domain</h3>
      <p>Secure your brand name through our integrated registrar store.</p>
      <h3>Step 3: Professional DNS Connection</h3>
      <p>Point your domain using A records for maximum speed and SEO benefit.</p>
    `
  },
  {
    title: "Social Media Marketing 101: Your First Ads",
    level: "starter",
    imageId: "guide-social-media",
    content: `
        <p>Social media is about providing value and building curiosity. Use our templates for Facebook, X, and LinkedIn to start promoting.</p>
        <h3>The Strategy: Value First</h3>
        <p>Warm up your audience before showing your link. Send traffic to your product review page for best results.</p>
    `
  },
  {
    title: "Content is King: Compelling Product Reviews",
    level: "plus",
    imageId: "guide-content-writing",
    content: `
        <p>A detailed review is your 24/7 salesperson. It builds trust, handles objections, and creates desire for the product.</p>
        <h3>Review Structure</h3>
        <p>Use attention-grabbing headlines, personal stories, and honest assessments of pros and cons to convert readers into referrals.</p>
    `
  },
  {
    title: "Email Marketing Basics: Building Your First List",
    level: "plus",
    imageId: "guide-email-marketing",
    content: `
      <p>An email list is a direct, intimate channel that you own. It is immune to social media algorithm changes.</p>
      <h3>The Four Pillars</h3>
      <p>Choose an Email Service Provider, create a high-value lead magnet, set up an opt-in form, and build a relationship with a welcome sequence.</p>
    `
  },
  {
    title: "Your Pre-Launch Checklist",
    level: "pro",
    imageId: "guide-pre-launch",
    content: `
        <p>Ensure your site is technically sound and ready to convert before driving traffic.</p>
        <h3>Phase 1: Production Credentials</h3>
        <p>Switch your PayPal and AI keys from sandbox to live production keys in your configuration.</p>
        <h3>Phase 2: DNS & Live Testing</h3>
        <p>Connect your custom domain via A records and perform a final end-to-end test of the signup flow.</p>
    `
  },
  {
    title: "Pay-Per-Click (PPC) Advertising for Affiliates",
    level: "pro",
    imageId: "guide-ppc-ads",
    content: `
      <p>Drive immediate, targeted traffic using Google and Microsoft Ads. Target long-tail keywords with clear buyer intent.</p>
      <h3>Affiliate PPC Rule</h3>
      <p>Never direct link to your affiliate URL in ads. Always send traffic to a high-quality landing page or review you own.</p>
    `
  },
  {
    title: "Conversion Rate Optimization (CRO) Fundamentals",
    level: "pro",
    imageId: "guide-cro-fundamentals",
    content: `
      <p>Maximize the percentage of visitors who click your link and sign up. Use A/B testing to refine your headlines and CTA buttons.</p>
      <h3>Test Everything</h3>
      <p>Even small changes to button colors or testimonial placement can lead to dramatic increases in revenue.</p>
    `
  },
  {
    title: "Your 7-Day Automated Follow-up Sequence",
    level: "pro",
    imageId: "guide-email-sequence",
    content: `
        <p>An automated drip campaign nurtures every new subscriber by delivering value and building trust over seven days.</p>
        <h3>The Sequence</h3>
        <p>Deliver your gift immediately, share value bombs, provide social proof, and finally ask for the sale with a risk-free call to action.</p>
    `
  },
  {
    title: "Strategic Partnerships & Joint Ventures",
    level: "enterprise",
    imageId: "guide-partnerships",
    content: `
      <p>Leverage established audiences through collaborative promotions. A successful JV can generate explosive growth for your business.</p>
      <h3>Mindset Shift</h3>
      <p>Move from being just an affiliate to becoming a business developer and strategic partner for other creators.</p>
    `
  }
];


export default function GuidesPage() {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData } = useDoc<UserType>(userDocRef);

  const processedContent = useMemo(() => {
    if (!selectedGuide) return '';
    let content = selectedGuide.content;

    const customDomainName = userData?.customDomain?.name;
    const username = userData?.username;
    
    const affiliateLink = customDomainName
      ? `https://${customDomainName}`
      : username
        ? `https://hostproai.com/?ref=${username}`
        : '#';

    content = content.replace(/\[YOUR_AFFILIATE_LINK_HERE\]/g, affiliateLink);
    
    if (username) {
        content = content.replace(/\[YOUR_USERNAME_HERE\]/g, username);
    }
    
    return content;
  }, [selectedGuide, userData]);


  const handleDownload = () => {
    if (!selectedGuide) return;

    const filename = `${selectedGuide.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${selectedGuide.title}</title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          h3 { color: #1a1a1a; }
          code { background-color: #f0f0f0; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
          a { color: #007bff; }
          ul, ol { padding-left: 20px; }
          blockquote { border-left: 4px solid #ccc; padding-left: 10px; margin-left: 0; color: #666; font-style: italic; }
          hr { border: 0; border-top: 1px solid #eee; margin: 2em 0; }
        </style>
      </head>
      <body>
        <h1>${selectedGuide.title}</h1>
        ${processedContent}
      </body>
      </html>
    `;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Marketing Guides</h1>
        <p className="text-muted-foreground">
          Your library of expert guides to help you grow your affiliate business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allGuides.map((guide) => {
            const guideImage = PlaceHolderImages.find(p => p.id === guide.imageId);
            return (
                <Card key={guide.title} className="flex flex-col overflow-hidden">
                    {guideImage ? (
                        <div className="relative h-48 w-full">
                            <Image
                                src={guideImage.imageUrl}
                                alt={guideImage.description}
                                data-ai-hint={guideImage.imageHint}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="relative h-48 w-full bg-secondary flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-muted-foreground" />
                        </div>
                    )}
                    <CardHeader>
                        <CardTitle>{guide.title}</CardTitle>
                        <CardDescription>
                            Access Level: <span className="font-semibold text-primary">{guide.level.charAt(0).toUpperCase() + guide.level.slice(1)}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1" />
                    <CardFooter>
                        <Button className="w-full" onClick={() => setSelectedGuide(guide)}>
                        Read Guide
                        </Button>
                    </CardFooter>
                </Card>
            )
        })}
      </div>

      <Dialog
        open={!!selectedGuide}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedGuide(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl pr-6">
              {selectedGuide?.title}
            </DialogTitle>
            <DialogDescription>
              Access Level: {selectedGuide?.level.charAt(0).toUpperCase() + (selectedGuide?.level.slice(1) || '')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-6 space-y-4 text-foreground/90 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_li]:pl-2 [&_code]:bg-muted [&_code]:font-mono [&_code]:px-1.5 [&_code]:py-1 [&_code]:rounded-sm [&_a]:text-primary [&_a]:hover:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground">
            <div
              dangerouslySetInnerHTML={{ __html: processedContent || '' }}
            />
          </div>
          <DialogFooter className="mt-4 sm:justify-start gap-2">
            <Button
                type="button"
                variant="outline"
                onClick={handleDownload}
            >
                <Download className="mr-2 h-4 w-4" />
                Download
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSelectedGuide(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

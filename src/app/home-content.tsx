'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingUp, Sparkles, Globe, Cpu, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { useSearchParams } from 'next/navigation';
import { PricingCards } from './pricing/pricing-cards';
import { Suspense, useState, useEffect } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

function HomeInner() {
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const refCode = isHydrated ? searchParams.get('ref') : null;

  const getLinkWithRef = (baseHref: string) => {
    if (!refCode) return baseHref;
    const [path, hash] = baseHref.split('#');
    const urlPath = path || '/';
    const url = new URL(urlPath, 'https://hostproai.com');
    url.searchParams.set('ref', refCode);
    return `${url.pathname}${url.search}${hash ? '#' + hash : ''}`;
  };

  const signupLink = getLinkWithRef('/pricing');

  const blogPosts = [
    { title: "Why Daily Payouts are the New Industry Standard", excerpt: "Traditional net-30 and net-60 payouts are killing your cash flow.", date: "Nov 12, 2024", category: "Market Analysis", slug: "daily-payouts", icon: <TrendingUp className="h-5 w-5" /> },
    { title: "The AI Edge: Automating Your Conversion Funnels", excerpt: "Leveraging LLMs to generate copy is now a requirement.", date: "Nov 10, 2024", category: "Technical Guide", slug: "ai-edge", icon: <Cpu className="h-5 w-5" /> },
    { title: "Infrastructure as an Income Source", excerpt: "Stop paying for hosting and start getting paid for it.", date: "Nov 08, 2024", category: "Strategy", slug: "infrastructure-income", icon: <Globe className="h-5 w-5" /> }
  ];

  const faqs = [
    { question: "How does the 70% commission structure work?", answer: "You start with 70% recurring commission on every active referral from day one." },
    { question: "When do I reach the 75% commission milestone?", answer: "Achieve 10 active referrals to unlock 75% recurring commissions." },
    { question: "How often are affiliate payouts processed?", answer: "Payouts are processed daily to your PayPal account every 24 hours." },
    { question: "What makes this hosting different for affiliates?", answer: "Integrated AI tools help your referrals convert better and stay longer." },
    { question: "Is there a minimum threshold for payouts?", answer: "No minimum thresholds. We pay daily regardless of the amount." }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden hero-gradient border-b">
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-100 bg-blue-50 text-blue-600 text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>Enterprise Grade Hosting & Affiliate Architecture</span>
              </div>
              <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900">
                The New Frontier of <br />
                <span className="text-blue-600">Affiliate Revenue</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
                Experience an ecosystem where high-performance hosting meets aggressive 70% daily commissions.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white" asChild>
                  <Link href={getLinkWithRef('/#packages')}>Explore Our Packages <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-xl" asChild>
                  <Link href={getLinkWithRef('/insights')}>View Knowledge Base</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="insights" className="py-24 bg-slate-50/50">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="space-y-4">
                <h2 className="font-headline text-3xl md:text-4xl font-bold text-red-600 uppercase">Latest Updates</h2>
                <p className="text-slate-600 text-lg max-w-xl">Deep dives into market dynamics and affiliate strategy.</p>
              </div>
              <Button variant="link" className="text-blue-600 font-bold group text-lg" asChild>
                <Link href={getLinkWithRef('/insights')}>
                  Visit Knowledge Base <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {blogPosts.map((post, i) => (
                <Link key={i} href={getLinkWithRef(`/insights/${post.slug}`)}>
                  <Card className="bg-white h-full hover:border-blue-400 transition-all group border-slate-200 shadow-sm">
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-blue-600">
                        <span className="flex items-center gap-2">{post.icon} {post.category}</span>
                        <span className="text-slate-400">{post.date}</span>
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-headline group-hover:text-red-600 transition-colors">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-slate-600 leading-relaxed">{post.excerpt}</p></CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="packages" className="py-24 bg-slate-50 border-y border-slate-200">
          <div className="container text-center space-y-12">
            <div className="max-w-3xl mx-auto space-y-4">
              <h2 className="font-headline text-4xl md:text-6xl font-bold text-red-600 uppercase">Select Configuration</h2>
              <p className="text-slate-600 text-lg md:text-xl">Your gateway to our high-ticket affiliate network.</p>
            </div>
            <PricingCards />
          </div>
        </section>

        <section id="faq" className="py-24 bg-white">
          <div className="container max-w-4xl">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-red-600 text-center uppercase mb-16">FAQ</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-2xl px-6 bg-slate-50/50">
                  <AccordionTrigger className="text-left text-lg font-bold py-6">
                    <div className="flex items-center gap-4">
                      <HelpCircle className="h-5 w-5 text-blue-600" />
                      <span>{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-lg leading-relaxed pb-6">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="py-32 bg-slate-900 text-white text-center">
          <div className="container max-w-4xl space-y-10">
            <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter">
              Ready to Shift <br /> <span className="text-red-600">Income Velocity?</span>
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button size="lg" className="h-16 px-12 text-xl font-bold rounded-2xl bg-blue-600 hover:bg-blue-700" asChild>
                <Link href={signupLink}>Start Your 3-Day Trial</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-12 text-xl font-bold rounded-2xl border-slate-700" asChild>
                <Link href={getLinkWithRef('/about')}>Meet the Founders</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function HomeContent() {
  return (
    <Suspense fallback={<div className="flex-1 animate-pulse bg-slate-50" />}>
      <HomeInner />
    </Suspense>
  );
}

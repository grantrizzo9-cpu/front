'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingUp, Zap, Shield, Sparkles, Globe, Cpu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useSearchParams } from 'next/navigation';
import { PricingCards } from './pricing/pricing-cards';
import { Suspense } from 'react';

function HomeInner() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');
  const signupLink = refCode ? `/pricing?ref=${refCode}` : '/pricing';

  const featureImage1 = PlaceHolderImages.find((img) => img.id === 'feature-1');

  const blogPosts = [
    {
      title: "Why Daily Payouts are the New Industry Standard",
      excerpt: "Traditional net-30 and net-60 payouts are killing your cash flow. We explore why real-time rewards are essential for high-velocity scaling.",
      date: "Nov 12, 2024",
      category: "Market Analysis",
      slug: "daily-payouts",
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      title: "The AI Edge: Automating Your Conversion Funnels",
      excerpt: "Leveraging Large Language Models to generate copy isn't just a trend—it's a requirement for modern affiliate marketers.",
      date: "Nov 10, 2024",
      category: "Technical Guide",
      slug: "ai-edge",
      icon: <Cpu className="h-5 w-5" />
    },
    {
      title: "Infrastructure as an Income Source",
      excerpt: "Stop paying for hosting and start getting paid for it. How our integrated ecosystem turns a business expense into a recurring asset.",
      date: "Nov 08, 2024",
      category: "Strategy",
      slug: "infrastructure-income",
      icon: <Globe className="h-5 w-5" />
    }
  ];

  return (
    <main className="flex-1">
      {/* Clean Professional Hero */}
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
              Experience an ecosystem where high-performance hosting meets aggressive 70% daily commissions. Built for those who demand more than 'standard'.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200" asChild>
                <Link href="#packages">Explore Our Packages <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-xl border-slate-200 hover:bg-slate-50" asChild>
                <Link href="/insights">View Knowledge Base</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Blog / Insights Section - With RED Headings */}
      <section id="insights" className="py-24 bg-slate-50/50">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 text-left">
            <div className="space-y-4">
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-red-600 m-0">Latest Platform Updates</h2>
              <p className="text-slate-600 text-lg max-w-xl">Deep dives into market dynamics, technical optimizations, and affiliate strategy.</p>
            </div>
            <Button variant="link" className="text-blue-600 font-bold group" asChild>
              <Link href="/insights">
                Visit Knowledge Base <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {blogPosts.map((post, i) => (
              <Link key={i} href={`/insights/${post.slug}`}>
                <Card className="bg-white h-full hover:border-blue-400 hover:shadow-md transition-all duration-300 group cursor-pointer border-slate-200 shadow-sm">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-blue-600">
                      <span className="flex items-center gap-2">{post.icon} {post.category}</span>
                      <span className="text-slate-400">{post.date}</span>
                    </div>
                    <CardTitle className="text-xl md:text-2xl font-headline group-hover:text-red-600 transition-colors leading-tight">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">{post.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Program Breakdown */}
      <section className="py-24">
        <div className="container grid gap-16 lg:grid-cols-2 items-center">
          <div className="relative aspect-square md:aspect-video rounded-3xl overflow-hidden border border-slate-200 shadow-xl group">
            {featureImage1 && (
              <Image
                src={featureImage1.imageUrl}
                alt="Architecture Overview"
                data-ai-hint="futuristic server room"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/90 backdrop-blur rounded-2xl border shadow-sm">
              <p className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-tighter">Infrastructure Power</p>
              <h3 className="text-xl font-bold font-headline mb-0 text-slate-900">Global Edge Network with NVMe Core.</h3>
            </div>
          </div>
          
          <div className="space-y-8 text-left">
            <h2 className="text-left font-headline text-4xl md:text-5xl font-extrabold tracking-tight leading-tight m-0 text-red-600">
              A Platform Engineered for <span className="text-blue-600">Performance & Profit</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Most affiliate programs are an afterthought. Ours is the foundation. We've built a high-availability hosting infrastructure and layered it with premium AI tools, creating a product that users never want to leave.
            </p>
            
            <div className="grid gap-6">
              {[
                { title: "70% Base Commissions", desc: "Start at a market-leading 70% recurring payout from your very first referral.", icon: <Zap className="text-blue-600" /> },
                { title: "Scale to 75%", desc: "Reach the 10-referral milestone and automatically unlock 75% lifetime commissions.", icon: <TrendingUp className="text-blue-600" /> },
                { title: "Daily PayPal Sync", desc: "Your earnings are processed and dispatched every 24 hours without fail.", icon: <Cpu className="text-blue-600" /> }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-1">{item.title}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Tiers */}
      <section id="packages" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="font-headline text-4xl md:text-6xl font-bold m-0 tracking-tight text-red-600">Select Your Configuration</h2>
            <p className="text-slate-600 text-lg md:text-xl">Every plan acts as a gateway to our high-ticket affiliate network.</p>
          </div>
          
          <PricingCards />
          
          <div className="flex flex-wrap justify-center items-center gap-8 pt-8 opacity-60">
            <div className="flex items-center gap-2 font-headline font-bold text-xl text-slate-400"><Shield className="h-6 w-6 text-blue-600" /> SECURE CORE</div>
            <div className="flex items-center gap-2 font-headline font-bold text-xl text-slate-400"><Zap className="h-6 w-6 text-blue-600" /> RAPID EDGE</div>
            <div className="flex items-center gap-2 font-headline font-bold text-xl text-slate-400"><Globe className="h-6 w-6 text-blue-600" /> GLOBAL REACH</div>
          </div>
        </div>
      </section>

      {/* Large Final Action */}
      <section className="py-32 relative overflow-hidden bg-white">
        <div className="container relative z-10 text-center max-w-4xl space-y-10">
          <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] m-0 text-slate-900">
            Ready to Shift Your <br />
            <span className="text-red-600">Income Velocity?</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Join the elite circle of affiliates who leverage premium infrastructure to drive daily results. Start with 70% and scale to 75%.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button size="lg" className="h-16 px-12 text-xl font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 transition-transform hover:scale-[1.02]" asChild>
              <Link href={signupLink}>Start Your 3-Day Trial</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-12 text-xl font-bold rounded-2xl border-slate-200 hover:bg-slate-50" asChild>
              <Link href="/about">Meet the Founders</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

export function HomeContent() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-body">
      <Header />
      <Suspense fallback={<div className="flex-1 animate-pulse bg-slate-50" />}>
        <HomeInner />
      </Suspense>
      <Footer />
    </div>
  );
}
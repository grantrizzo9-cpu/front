'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, TrendingUp, Zap, Shield, Sparkles, MessageSquare, Globe, Cpu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSearchParams } from 'next/navigation';
import { PricingCards } from './pricing/pricing-cards';
import { cn } from '@/lib/utils';

export function HomeContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');
  const signupLink = refCode ? `/pricing?ref=${refCode}` : '/pricing';

  const featureImage1 = PlaceHolderImages.find((img) => img.id === 'feature-1');
  const avatar1 = PlaceHolderImages.find((img) => img.id === 'testimonial-1');
  const avatar2 = PlaceHolderImages.find((img) => img.id === 'testimonial-2');
  const avatar3 = PlaceHolderImages.find((img) => img.id === 'testimonial-3');

  const blogPosts = [
    {
      title: "Why Daily Payouts are the New Industry Standard",
      excerpt: "Traditional net-30 and net-60 payouts are killing your cash flow. We explore why real-time rewards are essential for high-velocity scaling.",
      date: "Nov 12, 2024",
      category: "Market Analysis",
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      title: "The AI Edge: Automating Your Conversion Funnels",
      excerpt: "Leveraging Large Language Models to generate copy isn't just a trend—it's a requirement for modern affiliate marketers.",
      date: "Nov 10, 2024",
      category: "Technical Guide",
      icon: <Cpu className="h-5 w-5" />
    },
    {
      title: "Infrastructure as an Income Source",
      excerpt: "Stop paying for hosting and start getting paid for it. How our integrated ecosystem turns a business expense into a recurring asset.",
      date: "Nov 08, 2024",
      category: "Strategy",
      icon: <Globe className="h-5 w-5" />
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-body">
      <Header />
      <main className="flex-1">
        {/* Cinematic Hero */}
        <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden hero-gradient">
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-semibold animate-in fade-in duration-700">
                <Sparkles className="h-4 w-4" />
                <span>Enterprise Grade Hosting & Affiliate Architecture</span>
              </div>
              
              <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight">
                The New Frontier of <br />
                <span className="text-gradient">Affiliate Revenue</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                Experience an ecosystem where high-performance hosting meets aggressive 75% daily commissions. Built for those who demand more than 'standard'.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-xl shadow-2xl shadow-primary/30" asChild>
                  <Link href="#packages">Explore Our Packages <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-xl bg-card/50 backdrop-blur-md border-white/10 hover:bg-white/5" asChild>
                  <Link href="#insights">View Latest Insights</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Blog / Insights Section */}
        <section id="insights" className="py-24 border-y border-white/5 bg-black/20">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="space-y-4">
                <h2 className="font-headline text-3xl md:text-4xl font-bold text-left m-0">Latest Platform Updates</h2>
                <p className="text-muted-foreground text-lg max-w-xl">Deep dives into market dynamics, technical optimizations, and affiliate strategy.</p>
              </div>
              <Button variant="link" className="text-primary font-bold group">
                Visit Knowledge Base <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {blogPosts.map((post, i) => (
                <Card key={i} className="glass-card hover:bg-white/[0.03] transition-all duration-300 group cursor-pointer border-white/5">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-primary">
                      <span className="flex items-center gap-2">{post.icon} {post.category}</span>
                      <span className="text-muted-foreground">{post.date}</span>
                    </div>
                    <CardTitle className="text-xl md:text-2xl font-headline group-hover:text-primary transition-colors leading-tight">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Program Breakdown */}
        <section className="py-24">
          <div className="container grid gap-16 lg:grid-cols-2 items-center">
            <div className="relative aspect-square md:aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
              {featureImage1 && (
                <Image
                  src={featureImage1.imageUrl}
                  alt="Architecture Overview"
                  data-ai-hint="futuristic server room"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
              <div className="absolute bottom-8 left-8 right-8 p-6 glass-card rounded-2xl">
                <p className="text-sm font-bold text-primary mb-2 uppercase tracking-tighter">Infrastructure Power</p>
                <h3 className="text-xl font-bold font-headline mb-0">Global Edge Network with NVMe Core.</h3>
              </div>
            </div>
            
            <div className="space-y-8">
              <h2 className="text-left font-headline text-4xl md:text-5xl font-extrabold tracking-tight leading-tight m-0">
                A Platform Engineered for <span className="text-primary">Performance & Profit</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Most affiliate programs are an afterthought. Ours is the foundation. We've built a high-availability hosting infrastructure and layered it with premium AI tools, creating a product that users never want to leave.
              </p>
              
              <div className="grid gap-6">
                {[
                  { title: "Aggressive Commissions", desc: "Up to 75% recurring payouts, tracked with precision-engineered cookies.", icon: <Zap className="text-yellow-400" /> },
                  { title: "Daily PayPal Sync", desc: "Your earnings are processed and dispatched every 24 hours without fail.", icon: <TrendingUp className="text-green-400" /> },
                  { title: "AI-Powered Content", desc: "Built-in LLM tools to generate landing pages, ads, and blogs in seconds.", icon: <Cpu className="text-blue-400" /> }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-lg mb-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Subscription Tiers */}
        <section id="packages" className="py-24 bg-black/40 border-y border-white/5">
          <div className="container text-center space-y-12">
            <div className="max-w-3xl mx-auto space-y-4">
              <h2 className="font-headline text-4xl md:text-6xl font-bold m-0 tracking-tight">Select Your Configuration</h2>
              <p className="text-muted-foreground text-lg md:text-xl">Every plan acts as a gateway to our high-ticket affiliate network.</p>
            </div>
            
            <PricingCards />
            
            <div className="flex flex-wrap justify-center items-center gap-8 pt-8 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 font-headline font-bold text-xl"><Shield className="h-6 w-6 text-primary" /> SECURE CORE</div>
              <div className="flex items-center gap-2 font-headline font-bold text-xl"><Zap className="h-6 w-6 text-primary" /> RAPID EDGE</div>
              <div className="flex items-center gap-2 font-headline font-bold text-xl"><Globe className="h-6 w-6 text-primary" /> GLOBAL REACH</div>
            </div>
          </div>
        </section>

        {/* Large Final Action */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="container relative z-10 text-center max-w-4xl space-y-10">
            <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] m-0">
              Ready to Shift Your <br />
              <span className="text-gradient">Income Velocity?</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Join the elite circle of affiliates who leverage premium infrastructure to drive daily results. It's time to build your legacy.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button size="lg" className="h-16 px-12 text-xl font-black rounded-2xl shadow-primary/20 shadow-2xl hover:scale-[1.02] transition-transform" asChild>
                <Link href={signupLink}>Start Your 3-Day Trial</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-12 text-xl font-bold rounded-2xl border-white/10 hover:bg-white/5" asChild>
                <Link href="/about">Meet the Founders</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

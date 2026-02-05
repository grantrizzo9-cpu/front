
'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap, Users, Shield, ArrowRight, DollarSign, BrainCircuit, BookOpen, Star, Sparkles } from 'lucide-react';
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

  const testimonials = [
    { name: 'Sarah J.', role: 'Super Affiliate', avatar: avatar1, text: "I've never seen daily payouts this reliable. Affiliate AI Host has completely changed my financial outlook." },
    { name: 'Mike R.', role: 'Tech Blogger', avatar: avatar2, text: "The combination of web hosting and AI tools is genius. It's an incredibly easy sell, and my audience loves it." },
    { name: 'Emily C.', role: 'Digital Marketer', avatar: avatar3, text: "The most transparent and profitable program I've ever been a part of. The 70% commission is unbeatable." },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-white">
      <Header />
      <main className="flex-1">
        {/* Modern Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"></div>
          
          <div className="container relative z-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
              <Sparkles className="h-4 w-4" />
              <span>Next-Gen AI Hosting & Affiliate Platform</span>
            </div>
            
            <h1 className="font-headline text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 pb-4">
              Premium Hosting <br className="hidden md:block" />
              <span className="text-primary">Built for Affiliates</span>
            </h1>
            
            <p className="mt-8 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl leading-relaxed">
              Unlock 70%-75% recurring daily commissions. We provide the tools, the hosting, and the automated payouts. You just refer and earn.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-full shadow-xl shadow-primary/20" asChild>
                <Link href="#packages">View Packages <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold rounded-full bg-background/50 backdrop-blur-sm" asChild>
                <Link href="#features">How it Works</Link>
              </Button>
            </div>

            <div className="mt-16 flex items-center justify-center gap-8 opacity-50 grayscale transition-all hover:grayscale-0">
                <div className="flex items-center gap-2 font-headline font-bold text-xl"><Shield className="h-6 w-6" /> SECURE</div>
                <div className="flex items-center gap-2 font-headline font-bold text-xl"><Zap className="h-6 w-6" /> FAST</div>
                <div className="flex items-center gap-2 font-headline font-bold text-xl"><Users className="h-6 w-6" /> TRUSTED</div>
            </div>
          </div>
        </section>

        {/* Packages Section - The main focus */}
        <section id="packages" className="py-24 bg-secondary/30">
          <div className="container">
            <div className="mb-16 text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Choose Your Package</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                All plans include professional hosting, AI content tools, and a high-ticket affiliate partnership.
              </p>
            </div>
            
            <PricingCards />
            
            <p className="mt-12 text-center text-sm text-muted-foreground">
              * One-time activation fee applies to all new trials. Daily recurring payments begin after 3 days.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="flex flex-col gap-4 p-8 rounded-3xl border bg-card/50 transition-all hover:shadow-lg">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-headline">75% Commissions</h3>
                <p className="text-muted-foreground">Highest payouts in the industry. Earn more for every user you bring to the platform.</p>
              </div>
              <div className="flex flex-col gap-4 p-8 rounded-3xl border bg-card/50 transition-all hover:shadow-lg">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-headline">Daily Payouts</h3>
                <p className="text-muted-foreground">No net-30. No net-60. Get your commissions sent to your PayPal every single day.</p>
              </div>
              <div className="flex flex-col gap-4 p-8 rounded-3xl border bg-card/50 transition-all hover:shadow-lg">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-headline">AI Suite Included</h3>
                <p className="text-muted-foreground">Generate high-converting ads, blog posts, and websites using our built-in AI tools.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-24 bg-card border-y">
          <div className="container grid gap-16 lg:grid-cols-2 items-center">
            <div className="space-y-8">
              <h2 className="text-left font-headline text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Built for Scale</h2>
              <p className="text-lg text-muted-foreground">
                Affiliate AI Host isn't just hosting. It's a business engine designed to help you build an automated income stream.
              </p>
              <ul className="space-y-4">
                {[
                  "Unlimited bandwidth on high-tier plans",
                  "Global CDN for lightning fast load times",
                  "1-Click affiliate website deployment",
                  "Tiered marketing guides from beginner to pro",
                  "24/7 Priority support for all partners"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="rounded-full" asChild>
                <Link href={signupLink}>Start Your Journey</Link>
              </Button>
            </div>
            <div className="relative aspect-square lg:aspect-video overflow-hidden rounded-3xl border bg-muted shadow-2xl">
              {featureImage1 && (
                <Image
                  src={featureImage1.imageUrl}
                  alt="Dashboard Preview"
                  data-ai-hint="dashboard analytics"
                  fill
                  className="object-cover transition-transform hover:scale-105 duration-700"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-24 overflow-hidden">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
                <div>
                    <h2 className="text-left font-headline text-3xl font-bold m-0">Join the Top 1%</h2>
                    <p className="text-muted-foreground mt-2">Hear from our most successful affiliate partners.</p>
                </div>
                <div className="flex gap-1 text-primary">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-6 w-6 fill-current" />)}
                </div>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="bg-background border-none shadow-none text-left p-0">
                  <CardContent className="p-8 rounded-3xl bg-secondary/20 relative">
                    <div className="absolute -top-4 left-8 text-6xl text-primary/20 font-serif leading-none">“</div>
                    <p className="italic text-lg mb-6 leading-relaxed">"{testimonial.text}"</p>
                    <div className="flex items-center gap-4">
                        {testimonial.avatar && (
                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                            <AvatarImage src={testimonial.avatar.imageUrl} alt={testimonial.name} data-ai-hint="person portrait" />
                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        )}
                        <div>
                        <p className="font-bold">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">{testimonial.role}</p>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Large Final CTA */}
        <section className="py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container text-center max-w-4xl">
            <h2 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-8">
              Start Your 3-Day <br className="md:hidden" /> Trial Today
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto font-medium">
              Join hundreds of affiliates earning daily commissions. It takes less than 60 seconds to get started.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary" className="h-16 px-10 text-xl font-bold rounded-full shadow-2xl" asChild>
                <Link href={signupLink}>Get Started Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-bold rounded-full border-primary-foreground/20 hover:bg-primary-foreground/10" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

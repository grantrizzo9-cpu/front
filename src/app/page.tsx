

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Zap, Users, Shield, ArrowRight, DollarSign, BrainCircuit, BarChart, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { Logo } from '@/components/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NewsletterForm } from '@/components/newsletter-form';

export default function Home({ searchParams }: { searchParams?: { ref?: string } }) {
  const refCode = searchParams?.ref;
  const pricingLink = refCode ? `/pricing?ref=${refCode}` : '/pricing';

  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');
  const featureImage1 = PlaceHolderImages.find((img) => img.id === 'feature-1');
  const guidesImage = PlaceHolderImages.find((img) => img.id === 'feature-2');
  const featureImage3 = PlaceHolderImages.find((img) => img.id === 'feature-3');
  const avatar1 = PlaceHolderImages.find((img) => img.id === 'testimonial-1');
  const avatar2 = PlaceHolderImages.find((img) => img.id === 'testimonial-2');
  const avatar3 = PlaceHolderImages.find((img) => img.id === 'testimonial-3');

  const features = [
    {
        icon: <DollarSign className="w-8 h-8 text-primary" />,
        title: 'Generous 70% Commissions',
        description: 'Earn a massive 70% commission on every sale. Super affiliates who refer over 10 customers unlock an even higher 75% commission rate!',
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: 'Daily PayPal Payouts',
      description: 'No more waiting for your money. We pay out your commissions every single day directly to your PayPal account, like clockwork.',
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: 'Permanent Referrals',
      description: 'Once you refer a user, they are linked to you for life. You earn commissions on their initial purchase and all future upgrades.',
    },
    {
      icon: <BrainCircuit className="w-8 h-8 text-primary" />,
      title: 'Integrated AI Tools',
      description: 'Our subscription plans include access to powerful AI tools designed to help you and your referrals build and grow businesses faster.',
    },
    {
        icon: <BookOpen className="w-8 h-8 text-primary" />,
        title: 'Exclusive Marketing Guides',
        description: 'Access a library of expert-written guides. The more you upgrade, the more advanced strategies you unlock to boost your sales.',
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: 'Reliable Web Hosting',
      description: 'Offer your referrals top-tier, secure, and high-performance web hosting that they can depend on, increasing your conversion rates.',
    },
  ];

  const testimonials = [
    { name: 'Sarah J.', role: 'Super Affiliate', avatar: avatar1, text: "I've never seen daily payouts this reliable. Affiliate AI Host has completely changed my financial outlook. The 70% commission is just unbeatable." },
    { name: 'Mike R.', role: 'Tech Blogger', avatar: avatar2, text: "The combination of web hosting and AI tools is genius. It's an incredibly easy sell, and my audience loves it. My earnings have skyrocketed." },
    { name: 'Emily C.', role: 'Digital Marketer', avatar: avatar3, text: "The affiliate dashboard is a dream. All the stats I need are right there. This is the most transparent and profitable program I've ever been a part of." },
  ];

  const faqs = [
    { q: "How does the referral tracking work?", a: "When someone clicks your unique affiliate link, a cookie is stored in their browser that lasts forever. When they sign up, they are permanently linked to your account, and you will receive a 70% commission on their payments, rising to 75% after your 10th referral." },
    { q: "How and when do I get paid?", a: "We process all commission payouts daily. All your earned commissions from the previous day are automatically sent to the PayPal account you have on file. It's fully automated." },
    { q: "What am I selling?", a: "You are promoting our subscription plans which include high-quality web hosting and a suite of powerful AI tools designed to help users build and grow their online businesses." },
    { q: "Is there a limit to how much I can earn?", a: "Absolutely not! There is no cap on your potential earnings. The more customers you refer, the more you earn. With a base 70% commission rate that rises to 75% for top affiliates, the sky is the limit." },
    { q: "What is your trial and refund policy?", a: "We offer an incredible risk-free trial. You pay only for your first day of service, and then you get the next 3 days completely free to explore the platform, use the AI tools, and start making referrals. This gives you a few days to see the value and start earning before your daily billing begins." },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full pt-20 pb-24 md:pt-32 md:pb-40 text-center bg-card">
          <div className="container z-10 relative">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Earn 70%-75% Daily Commissions with <span className="text-primary">AI-Powered Hosting</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
              Pay for your first day, get a 3-day free trial, and get paid daily for every referral you make. Our automated system handles everything.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href={pricingLink}>Become an Affiliate Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32">
          <div className="container">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Why Partner with Affiliate AI Host?</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                We've built the ultimate platform for affiliates to thrive.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="flex flex-col items-center text-center p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="font-headline mb-2 text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section className="w-full py-20 md:py-32 bg-card">
          <div className="container grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Your Simple Path to Daily Income</h2>
              <p className="mt-4 text-lg text-muted-foreground">In just three easy steps, you can be on your way to earning reliable, daily income.</p>
              <ul className="mt-8 space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-lg">Join & Get Your Link</h3>
                    <p className="text-muted-foreground">Sign up for any plan to instantly become an affiliate and receive your unique referral link.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-lg">Promote & Refer</h3>
                    <p className="text-muted-foreground">Share your link through your blog, social media, or email list. Our high-value offer converts visitors into customers.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h3 className="font-semibold text-lg">Get Paid Daily</h3>
                    <p className="text-muted-foreground">Earn a 70-75% commission for every sale, paid out automatically to your PayPal every single day.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative h-80 lg:h-full w-full">
              {featureImage1 && (
                <Image
                  src={featureImage1.imageUrl}
                  alt={featureImage1.description}
                  data-ai-hint={featureImage1.imageHint}
                  fill
                  className="object-cover rounded-lg shadow-lg"
                />
              )}
            </div>
          </div>
        </section>

        {/* Marketing Guides Section */}
        <section id="guides" className="w-full py-20 md:py-32">
          <div className="container grid gap-12 lg:grid-cols-2 items-center">
             <div className="relative h-80 lg:h-full w-full">
              {guidesImage && (
                <Image
                  src={guidesImage.imageUrl}
                  alt={guidesImage.description}
                  data-ai-hint={guidesImage.imageHint}
                  fill
                  className="object-cover rounded-lg shadow-lg"
                />
              )}
            </div>
            <div>
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">From Beginner to Pro: Your Marketing Playbook</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                  Our subscription tiers come with a tiered library of marketing guides. The higher your plan, the more you learn, and the more you earn.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold">Starter Guides</h3>
                    <p className="text-muted-foreground text-sm">Learn the fundamentals of affiliate marketing, SEO basics, and social media promotion.</p>
                  </div>
                </li>
                 <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold">Plus Guides</h3>
                    <p className="text-muted-foreground text-sm">Dive into content creation, email marketing, and web analytics to grow your audience.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold">Pro &amp; Enterprise Guides</h3>
                    <p className="text-muted-foreground text-sm">Master advanced SEO, PPC advertising, conversion optimization, and strategic partnerships to scale your income.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>


        {/* Testimonials */}
        <section id="testimonials" className="py-20 md:py-32 bg-card">
          <div className="container">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Trusted by Top Earners</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Don't just take our word for it. Here's what our affiliates are saying.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-1 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name}>
                  <CardContent className="pt-6">
                    <p className="italic">"{testimonial.text}"</p>
                  </CardContent>
                  <CardFooter className="flex items-center gap-4">
                    {testimonial.avatar && (
                       <Avatar>
                         <AvatarImage src={testimonial.avatar.imageUrl} alt={testimonial.name} data-ai-hint={testimonial.avatar.imageHint} />
                         <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                       </Avatar>
                    )}
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-20 md:py-32">
          <div className="container max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Have questions? We have answers.
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full mt-12">
              {faqs.map((faq, i) => (
                <AccordionItem value={`item-${i}`} key={i}>
                  <AccordionTrigger className="text-lg font-semibold text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="w-full py-20 md:py-32 bg-card">
          <div className="container text-center max-w-3xl">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
              Stay Ahead of the Curve
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Join our newsletter to get the latest updates on affiliate strategies, AI tools, and platform features delivered straight to your inbox.
            </p>
            <div className="mt-8 flex justify-center">
              <NewsletterForm />
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="w-full py-20 md:py-32">
          <div className="container text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Ready to Start Earning?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Join hundreds of affiliates earning daily commissions. Your journey to financial freedom starts here. It takes less than 60 seconds to get started.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="text-lg py-7 px-10">
                <Link href={pricingLink}>
                  Claim Your 70% Commission Rate
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

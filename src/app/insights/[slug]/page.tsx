'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import Link from 'next/link';
import { use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const insightsContent: Record<string, any> = {
  'daily-payouts': {
    title: "Why Daily Payouts are the New Industry Standard",
    category: "Market Analysis",
    date: "Nov 12, 2024",
    author: "Strategy Team",
    readTime: "6 min read",
    content: `
      <p>In the high-velocity world of affiliate marketing, cash flow is the heartbeat of scalability. For decades, the industry has relied on archaic "Net-30" or "Net-60" payout structures, essentially forcing affiliates to provide interest-free loans to the platforms they promote. We believe those days are over.</p>
      
      <h3>The Velocity Problem</h3>
      <p>When you are running paid traffic, every dollar counts. If you spend $1,000 today to earn $2,000 in commissions, but you can't access that $2,000 for 60 days, your growth is capped by your initial capital. Daily payouts solve this by allowing you to reinvest your profits immediately.</p>
      
      <h3>Risk Mitigation</h3>
      <p>Holding large balances in affiliate accounts is inherently risky. Platforms can change terms, go bankrupt, or experience technical issues. Daily payouts ensure that your hard-earned revenue is safe in your own wallet every single day.</p>
      
      <h3>Our Commitment</h3>
      <p>At Affiliate AI Host, we've engineered our financial layer to sync directly with PayPal. When your referrals' recurring payments clear, your 70-75% commission is processed within 24 hours. No minimum thresholds, no delays, just pure performance rewards.</p>
    `
  },
  'ai-edge': {
    title: "The AI Edge: Automating Your Conversion Funnels",
    category: "Technical Guide",
    date: "Nov 10, 2024",
    author: "Dev Team",
    readTime: "8 min read",
    content: `
      <p>Generating high-converting copy is the single most time-consuming task for any marketer. By leveraging Large Language Models (LLMs), you can now build entire campaigns in the time it used to take to write a single headline.</p>
      
      <h3>Strategic Prompting</h3>
      <p>AI isn't about replacing the marketer; it's about amplifying them. Our built-in content studio uses custom-trained prompts specifically designed for the affiliate niche. This means the copy it generates is already primed for high-ticket conversions.</p>
      
      <h3>Content Scaling</h3>
      <p>SEO requires volume. With AI, you can generate blog intros, product descriptions, and social media posts at a scale that was previously impossible for solo entrepreneurs. This allows you to dominate multiple niches simultaneously.</p>
      
      <h3>The Integrated Approach</h3>
      <p>Because our AI tools are integrated directly into your hosting dashboard, you can move from "Idea" to "Live Page" in under 60 seconds. This speed-to-market is what separates the top earners from the rest of the pack.</p>
    `
  },
  'infrastructure-income': {
    title: "Infrastructure as an Income Source",
    category: "Strategy",
    date: "Nov 08, 2024",
    author: "Platform Architecture",
    readTime: "5 min read",
    content: `
      <p>Most business owners view web hosting as an expense—a monthly bill that provides a necessary service. We've flipped that model on its head by turning infrastructure into a recurring revenue asset.</p>
      
      <h3>The Hosting Advantage</h3>
      <p>Hosting is "sticky." Once a user builds their site on a platform, they rarely leave. This makes it the perfect product for recurring commissions. Unlike one-off software sales, hosting generates income for years.</p>
      
      <h3>Technical Superiority</h3>
      <p>We provide enterprise-grade NVMe storage and a global edge network. When you refer a customer, you're not just selling them a link; you're selling them the foundation of their own business success. This high-value offer leads to lower churn and higher lifetime value (LTV) for you.</p>
      
      <h3>70-75% Recurring Payouts</h3>
      <p>By keeping our overhead lean and automating our support via AI, we are able to pass the majority of the revenue directly to you. Starting at 70% and scaling to 75% after 10 referrals, this is the most aggressive commission structure in the hosting industry.</p>
    `
  }
};

function ArticleInner({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');
  const article = insightsContent[slug];

  const getLinkWithRef = (baseHref: string) => {
    if (!refCode) return baseHref;
    const url = new URL(baseHref, 'http://dummybase.com');
    url.searchParams.set('ref', refCode);
    return `${url.pathname}${url.search}`;
  };

  if (!article) {
    return (
      <div className="flex flex-col min-h-[60vh] items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
        <Button asChild><Link href={getLinkWithRef('/')}>Return Home</Link></Button>
      </div>
    );
  }

  return (
    <article className="container max-w-3xl">
      <Button variant="ghost" asChild className="mb-8 -ml-4 text-muted-foreground">
        <Link href={getLinkWithRef('/insights')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Insights
        </Link>
      </Button>

      <div className="space-y-6 mb-12">
        <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-bold uppercase tracking-widest">
          {article.category}
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline text-slate-900 leading-tight">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm border-y py-4 border-slate-100">
          <div className="flex items-center gap-2"><User className="h-4 w-4" /> {article.author}</div>
          <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {article.date}</div>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {article.readTime}</div>
        </div>
      </div>

      <div 
        className="prose prose-slate max-w-none prose-lg
          [&_p]:text-slate-600 [&_p]:leading-relaxed [&_p]:mb-6
          [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-10 [&_h3]:mb-4
          [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-red-600 [&_h2]:mt-12 [&_h2]:mb-6"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      <div className="mt-20 p-8 rounded-3xl bg-slate-50 border border-slate-100 text-center space-y-6">
        <h2 className="text-3xl font-bold font-headline text-slate-900">Ready to put these strategies into action?</h2>
        <p className="text-slate-600 max-w-md mx-auto">Join our affiliate program today and start earning 70% daily commissions.</p>
        <Button size="lg" className="h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-700" asChild>
          <Link href={getLinkWithRef('/pricing')}>Get Started Now</Link>
        </Button>
      </div>
    </article>
  );
}

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <Suspense fallback={<div className="container max-w-3xl animate-pulse space-y-8"><div className="h-12 w-3/4 bg-slate-100" /><div className="h-64 w-full bg-slate-50" /></div>}>
          <ArticleInner slug={slug} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

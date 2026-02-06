'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Cpu, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function InsightsContent() {
  const articles = [
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
    <div className="container max-w-5xl">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-red-600 mb-4">Platform Insights</h1>
        <p className="text-xl text-muted-foreground">Expert guides and market analysis for the modern affiliate.</p>
      </div>

      <div className="grid gap-8">
        {articles.map((article) => (
          <Link key={article.slug} href={`/insights/${article.slug}`}>
            <Card className="hover:border-blue-400 hover:shadow-lg transition-all group overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <CardHeader className="flex-1 p-8">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">
                    {article.icon}
                    <span>{article.category}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-400">{article.date}</span>
                  </div>
                  <CardTitle className="text-2xl md:text-3xl font-headline group-hover:text-red-600 transition-colors mb-4">
                    {article.title}
                  </CardTitle>
                  <CardContent className="p-0">
                    <p className="text-slate-600 text-lg leading-relaxed mb-6">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center text-blue-600 font-bold">
                      Read Full Article <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </CardHeader>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function InsightsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-20">
        <Suspense fallback={<div className="container max-w-5xl animate-pulse space-y-8"><div className="h-12 w-3/4 bg-slate-100" /><div className="h-64 w-full bg-slate-50" /></div>}>
          <InsightsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
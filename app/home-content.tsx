import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Code, DollarSign, Zap, ExternalLink } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="text-center py-20 px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter !leading-[1.15]">
          The Future of Web Hosting is Here
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
          Blazing-fast, AI-powered hosting that scales with you. Get the performance, reliability, and support you need to grow your business.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" asChild>
            <a href="/signup">Get Started for Free <ArrowRight className="ml-2 h-5 w-5" /></a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="/pricing">View Pricing <DollarSign className="ml-2 h-5 w-5" /></a>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Our Platform?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-4" />
                <CardTitle>AI-Powered Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Our intelligent platform optimizes your site's performance automatically, ensuring the fastest possible load times.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CheckCircle className="h-8 w-8 text-primary mb-4" />
                <CardTitle>99.9% Uptime Guarantee</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">With our rock-solid infrastructure, you can rest easy knowing your site is always available for your visitors.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Code className="h-8 w-8 text-primary mb-4" />
                <CardTitle>Developer-Friendly</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Full support for Next.js and other modern frameworks. Deploy your sites with a single command.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Experience the Difference?</h2>
          <p className="text-muted-foreground text-xl mb-8">
            Join thousands of developers and businesses who trust us to host their most important projects.
          </p>
          <Button size="lg" asChild>
            <a href="/signup">Deploy Your First Site in Minutes <ArrowRight className="ml-2 h-5 w-5" /></a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">&copy; 2024 Your Company, Inc. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="/about" className="text-muted-foreground hover:text-foreground">About</a>
              <a href="/contact" className="text-muted-foreground hover:text-foreground">Contact</a>
              <a href="/terms" className="text-muted-foreground hover:text-foreground">Terms</a>
              <a href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

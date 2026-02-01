'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateWebsite, type GenerateWebsiteOutput } from '@/ai/flows/website-generator';
import { Loader2, AlertTriangle, Wand2, ArrowRight, Copy, Eye, Code } from 'lucide-react';
import { useUser } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

export default function AiWebsitePage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  
  const [generatedSite, setGeneratedSite] = useState<GenerateWebsiteOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const affiliateLink = user?.displayName ? `https://hostproai.com/?ref=${user.displayName.toLowerCase()}` : '#';

  const handleGenerate = async () => {
    if (!user?.displayName) {
      toast({
        variant: 'destructive',
        title: 'Username Not Found',
        description: 'We couldn\'t find your username. Please make sure it\'s set in your profile.',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedSite(null);
    setError(null);

    try {
      const result = await generateWebsite({ username: user.displayName });
      if (result.error) {
        setError(result.error);
      } else {
        setGeneratedSite(result);
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected problem occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toHtml = (content: string) => {
      return content.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p.trim()}</p>`).join('\n');
  }

  const copyHtml = (content: string, title: string) => {
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1, h2 { color: #1a1a1a; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${toHtml(content)}
      </body>
      </html>
    `;
    navigator.clipboard.writeText(fullHtml);
    toast({ title: 'Copied to Clipboard!', description: `${title} page HTML has been copied.` });
  };
  
  const copyHomepageHtml = () => {
      if (!generatedSite) return;
      const { homepage } = generatedSite;
      const featuresHtml = homepage.features.map(f => `
          <div>
              <h3>${f.title}</h3>
              <p>${f.description}</p>
          </div>
      `).join('');

      const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${homepage.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; color: #212529; text-align: center; }
            .hero { background-color: #ffffff; padding: 80px 20px; }
            h1 { font-size: 3rem; margin-bottom: 1rem; }
            p { font-size: 1.25rem; color: #6c757d; }
            .cta { display: inline-block; background-color: #007bff; color: #ffffff; padding: 15px 30px; font-size: 1.25rem; text-decoration: none; border-radius: 5px; margin-top: 2rem; }
            .features { padding: 60px 20px; }
            .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto; }
            .feature { background-color: #ffffff; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            footer { padding: 40px 20px; font-size: 0.9rem; color: #6c757d;}
            footer a { color: #007bff; text-decoration: none; }
          </style>
        </head>
        <body>
            <header class="hero">
                <h1>${homepage.headline}</h1>
                <p>${homepage.subheadline}</p>
                <a href="${affiliateLink}" class="cta">${homepage.ctaButtonText}</a>
            </header>
            <main class="features">
                <h2>Why Choose Affiliate AI Host?</h2>
                <div class="features-grid">
                    ${featuresHtml}
                </div>
            </main>
            <footer>
                <p>&copy; ${new Date().getFullYear()} | <a href="terms.html">Terms</a> | <a href="privacy.html">Privacy</a> | <a href="disclaimer.html">Disclaimer</a></p>
                <p>This is an independent affiliate website. We may earn a commission from purchases made through links on this site.</p>
            </footer>
        </body>
      </html>
    `;
    navigator.clipboard.writeText(fullHtml);
    toast({ title: 'Copied to Clipboard!', description: `Homepage HTML has been copied.` });
  }

  const renderContent = () => {
    if (isLoading) {
      return <WebsitePreviewSkeleton />;
    }
    if (error) {
      return (
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle /> Generation Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>An error occurred while generating your website.</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
    }
    if (generatedSite) {
      return <WebsitePreview site={generatedSite} onCopyHomepage={copyHomepageHtml} onCopyLegal={copyHtml} affiliateLink={affiliateLink} />;
    }
    return (
      <div className="col-span-full flex flex-col items-center justify-center text-center text-muted-foreground bg-secondary/30 rounded-lg p-12 min-h-[400px]">
        <Wand2 className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold text-foreground">Your AI Website Awaits</h3>
        <p>Click the "Generate Website" button to create your personalized affiliate site.</p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI Website Generator</h1>
        <p className="text-muted-foreground">
          Instantly create a personalized, high-converting affiliate website with one click.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Launch Your Site</CardTitle>
          <CardDescription>
            The AI will generate a unique homepage and all necessary legal pages for you, embedded with your affiliate link.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={isLoading || isUserLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Wand2 className="mr-2 h-4 w-4" /> Generate Website</>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {renderContent()}
    </div>
  );
}

// Preview Component
const WebsitePreview = ({ site, onCopyHomepage, onCopyLegal, affiliateLink }: { site: GenerateWebsiteOutput, onCopyHomepage: () => void, onCopyLegal: (content: string, title: string) => void, affiliateLink: string }) => (
    <Tabs defaultValue="preview" className="col-span-full">
        <div className="flex justify-between items-center pr-1">
            <TabsList>
                <TabsTrigger value="preview"><Eye className="mr-2" /> Preview</TabsTrigger>
                <TabsTrigger value="code"><Code className="mr-2" /> Get HTML</TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="preview">
            <Card>
                <CardHeader>
                    <CardTitle>{site.homepage.title}</CardTitle>
                </CardHeader>
                <CardContent className="border-t">
                    <div className="bg-card text-card-foreground rounded-lg p-8 text-center mt-6">
                        <h1 className="text-4xl font-bold font-headline">{site.homepage.headline}</h1>
                        <p className="mt-4 text-xl text-muted-foreground">{site.homepage.subheadline}</p>
                        <Button size="lg" className="mt-8" asChild>
                            <a href={affiliateLink} target="_blank" rel="noopener noreferrer">
                                {site.homepage.ctaButtonText} <ArrowRight className="ml-2" />
                            </a>
                        </Button>
                    </div>
                     <div className="mt-12">
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            {site.homepage.features.map(feature => (
                                <div key={feature.title}>
                                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                                    <p className="text-muted-foreground mt-2">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="code">
            <Card>
                <CardHeader>
                    <CardTitle>Your Website Code</CardTitle>
                    <CardDescription>Copy the HTML for each page and upload them to your web host.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Homepage (index.html)</h3>
                            <Button variant="outline" size="sm" onClick={onCopyHomepage}><Copy className="mr-2"/> Copy HTML</Button>
                        </div>
                        <Textarea readOnly value={`<html>... (Full homepage code) ...</html>`} className="font-mono text-xs" rows={3}/>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Terms of Service (terms.html)</h3>
                            <Button variant="outline" size="sm" onClick={() => onCopyLegal(site.terms, 'Terms of Service')}><Copy className="mr-2"/> Copy HTML</Button>
                        </div>
                        <Textarea readOnly value={site.terms} className="font-mono text-xs" rows={3}/>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Privacy Policy (privacy.html)</h3>
                             <Button variant="outline" size="sm" onClick={() => onCopyLegal(site.privacy, 'Privacy Policy')}><Copy className="mr-2"/> Copy HTML</Button>
                        </div>
                        <Textarea readOnly value={site.privacy} className="font-mono text-xs" rows={3}/>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Earnings Disclaimer (disclaimer.html)</h3>
                            <Button variant="outline" size="sm" onClick={() => onCopyLegal(site.disclaimer, 'Earnings Disclaimer')}><Copy className="mr-2"/> Copy HTML</Button>
                        </div>
                        <Textarea readOnly value={site.disclaimer} className="font-mono text-xs" rows={3}/>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
);


// Skeleton for loading state
const WebsitePreviewSkeleton = () => (
    <Card className="col-span-full">
        <CardHeader>
            <Skeleton className="h-8 w-1/2" />
        </CardHeader>
        <CardContent className="border-t">
            <div className="p-8 text-center mt-6 space-y-4">
                <Skeleton className="h-12 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-full max-w-md mx-auto" />
                <Skeleton className="h-12 w-48 mx-auto" />
            </div>
            <div className="mt-12">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-6 w-3/4 mx-auto" />
                            <Skeleton className="h-4 w-full mx-auto" />
                            <Skeleton className="h-4 w-5/6 mx-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
    </Card>
);

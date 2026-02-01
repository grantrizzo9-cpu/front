
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/card';
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
  
  const getHomepageHtml = useCallback((site: GenerateWebsiteOutput, link: string) => {
      const { homepage, theme } = site;
      
      const themeColorsCss = Object.entries(theme.colors)
          .map(([key, value]) => `    ${key}: ${value};`)
          .join('\n');
      
      const navLinksHtml = homepage.navLinks.map(link => `<li><a href="${link.href}">${link.text}</a></li>`).join('');

      const featuresHtml = homepage.features.map(f => `
          <div class="feature">
              <div class="feature-icon">${f.icon}</div>
              <h3>${f.title}</h3>
              <p>${f.description}</p>
          </div>
      `).join('');

      const howItWorksStepsHtml = homepage.howItWorksSteps.map((step, i) => `
        <div class="step">
            <div class="step-number">${i + 1}</div>
            <div>
                <h3>${step.title}</h3>
                <p>${step.description}</p>
            </div>
        </div>
      `).join('');

      const testimonialsHtml = homepage.testimonials.map(t => `
        <div class="testimonial-card">
            <p class="testimonial-text">"${t.text}"</p>
            <div class="testimonial-author">
                <p class="author-name">${t.name}</p>
                <p class="author-role">${t.role}</p>
            </div>
        </div>
      `).join('');

      const faqsHtml = homepage.faqs.map(faq => `
        <details class="faq-item">
            <summary>${faq.question}</summary>
            <p>${faq.answer}</p>
        </details>
      `).join('');
      
      const footerLinksHtml = `
          <a href="terms.html">Terms</a> |
          <a href="privacy.html">Privacy</a> |
          <a href="disclaimer.html">Disclaimer</a>
      `;

      return `
<!DOCTYPE html>
<html lang="en" style="scroll-behavior: smooth;">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${homepage.title}</title>
    <style>
        :root {
${themeColorsCss}
        }
        body { 
            font-family: var(--font-body); margin: 0; padding: 0; background-color: var(--background-color); color: var(--text-color); 
            line-height: 1.7;
        }
        .container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
        section { padding: 60px 0; }
        @media(min-width: 768px) { section { padding: 80px 0; } }
        h1, h2, h3 { font-family: var(--font-headline); font-weight: 700; margin-top: 0; letter-spacing: -0.02em; }
        h1 { font-size: 2.5rem; }
        h2 { font-size: 2.25rem; text-align: center; margin-bottom: 3rem; }
        @media(min-width: 768px) { h1 { font-size: 3.5rem; } h2 { font-size: 2.75rem; } }
        p { margin-top: 0; }
        a { color: var(--primary-color); text-decoration: none; }
        .btn { display: inline-block; background-color: var(--primary-color); color: white; padding: 14px 28px; font-size: 1rem; font-weight: 600; border-radius: 8px; text-decoration: none; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .btn:hover { background-color: var(--secondary-color); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
        .hero .btn, .final-cta .btn { color: var(--background-color); background-color: var(--card-background); }
        .hero .btn:hover, .final-cta .btn:hover { opacity: 0.9; }

        /* Header */
        header.main-header {
            position: sticky; top: 0; background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); z-index: 100; border-bottom: 1px solid #E5E7EB;
        }
        header .container { display: flex; align-items: center; justify-content: space-between; height: 72px; }
        .logo { font-size: 1.25rem; font-weight: 700; font-family: var(--font-headline); color: var(--text-color); }
        .main-nav ul { list-style: none; margin: 0; padding: 0; display: flex; gap: 1.5rem; }
        .main-nav a { font-weight: 500; color: var(--muted-color); transition: color 0.2s; }
        .main-nav a:hover { color: var(--text-color); }
        header.main-header {
            background: color-mix(in srgb, var(--card-background) 80%, transparent);
        }

        /* Hero */
        .hero { text-align: center; padding: 80px 0; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; }
        .hero h1 { color: white; }
        .hero p { font-size: 1.1rem; color: rgba(255, 255, 255, 0.9); max-width: 650px; margin: 1.5rem auto 2.5rem; }
        @media(min-width: 768px) { .hero p { font-size: 1.25rem; } }

        /* Sections */
        .section-alt { background-color: var(--card-background); }
        body[data-theme="dark"] .section-alt { background-color: color-mix(in srgb, var(--background-color) 70%, white); }

        /* Features */
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
        .feature { text-align: center; }
        .feature-icon { font-size: 2rem; margin-bottom: 1rem; line-height: 1; color: var(--primary-color); }
        .feature h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .feature p { color: var(--muted-color); font-size: 0.95rem; }

        /* How it Works */
        .steps-grid { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
        @media(min-width: 768px) { .steps-grid { grid-template-columns: repeat(3, 1fr); } }
        .step { display: flex; align-items: flex-start; gap: 1.5rem; text-align: left; }
        .step-number { flex-shrink: 0; width: 40px; height: 40px; background-color: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.25rem; font-family: var(--font-headline); }
        .step h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .step p { color: var(--muted-color); margin-bottom: 0; font-size: 0.95rem; }
        
        /* Testimonials */
        .testimonials-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media(min-width: 768px) { .testimonials-grid { grid-template-columns: repeat(3, 1fr); } }
        .testimonial-card { background: var(--card-background); padding: 2rem; border-radius: 12px; border: 1px solid #E5E7EB; }
        body[data-theme="dark"] .testimonial-card { border-color: color-mix(in srgb, var(--background-color) 50%, white); }
        .testimonial-text { font-style: italic; color: var(--muted-color); }
        .testimonial-author { margin-top: 1.5rem; }
        .author-name { font-weight: 600; }
        .author-role { font-size: 0.9rem; color: var(--muted-color); }

        /* FAQ */
        .faq-container { max-width: 768px; margin: 0 auto; }
        .faq-item { border-bottom: 1px solid #E5E7EB; padding: 1rem 0; }
        body[data-theme="dark"] .faq-item { border-color: color-mix(in srgb, var(--background-color) 50%, white); }
        .faq-item summary { font-size: 1.1rem; font-weight: 600; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item summary::after { content: '+'; font-size: 1.5rem; font-weight: 400; transition: transform 0.2s; color: var(--primary-color); }
        .faq-item[open] summary::after { transform: rotate(45deg); }
        .faq-item p { margin-top: 1rem; color: var(--muted-color); padding-left: 0.5rem; border-left: 2px solid var(--primary-color); }
        
        /* Final CTA */
        .final-cta { text-align: center; }
        .final-cta p { font-size: 1.1rem; color: var(--muted-color); max-width: 650px; margin: 1.5rem auto 2.5rem; }
        @media(min-width: 768px) { .final-cta p { font-size: 1.25rem; } }

        /* Footer */
        footer { padding: 40px 20px; text-align: center; border-top: 1px solid #E5E7EB; margin-top: 60px; background: var(--card-background); }
        body[data-theme="dark"] footer { border-color: color-mix(in srgb, var(--background-color) 50%, white); }
        .footer-logo { font-size: 1.25rem; font-weight: 700; font-family: var(--font-headline); margin-bottom: 1rem; color: var(--text-color); }
        .footer-links { margin-bottom: 1rem; }
        .footer-links a { margin: 0 0.75rem; font-weight: 500; color: var(--muted-color); transition: color 0.2s; }
        .footer-links a:hover { color: var(--text-color); }
        .footer-legal { font-size: 0.8rem; color: #9CA3AF; max-width: 500px; margin: 0.5rem auto 0; }
    </style>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
</head>
<body data-theme="${theme.name === 'Midnight Glow' ? 'dark': 'light'}">

    <header class="main-header">
        <div class="container">
            <div class="logo">${homepage.title}</div>
            <nav class="main-nav"><ul>${navLinksHtml}</ul></nav>
            <a href="${link}" class="btn">Sign Up</a>
        </div>
    </header>

    <main>
        <section id="hero" class="hero">
            <div class="container">
                <h1>${homepage.headline}</h1>
                <p>${homepage.subheadline}</p>
                <a href="${link}" class="btn">${homepage.ctaButtonText}</a>
            </div>
        </section>

        <section id="features" class="container">
            <h2>${homepage.featuresHeadline}</h2>
            <div class="features-grid">${featuresHtml}</div>
        </section>

        <section id="how-it-works" class="section-alt">
            <div class="container">
                <h2>${homepage.howItWorksHeadline}</h2>
                <div class="steps-grid">${howItWorksStepsHtml}</div>
            </div>
        </section>

        <section id="testimonials" class="container">
             <h2>${homepage.testimonialsHeadline}</h2>
            <div class="testimonials-grid">${testimonialsHtml}</div>
        </section>

        <section id="faq" class="section-alt">
            <div class="container">
                <h2>${homepage.faqHeadline}</h2>
                <div class="faq-container">${faqsHtml}</div>
            </div>
        </section>
        
        <section id="final-cta" class="final-cta container">
            <h2>${homepage.finalCtaHeadline}</h2>
            <p>${homepage.finalCtaSubheadline}</p>
            <a href="${link}" class="btn">${homepage.finalCtaButtonText}</a>
        </section>
    </main>
    
    <footer>
        <div class="container">
            <div class="footer-logo">${homepage.title}</div>
            <div class="footer-links">${footerLinksHtml}</div>
            <p class="footer-legal">&copy; ${new Date().getFullYear()}. All rights reserved.</p>
            <p class="footer-legal">This is an independent affiliate website. We may earn a commission from purchases made through links on this site.</p>
        </div>
    </footer>
</body>
</html>
    `;
  }, []);

  const toHtml = (content: string) => {
      return content.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p.trim()}</p>`).join('\n');
  }

  const copyHomepageHtml = useCallback(() => {
    if (!generatedSite) return;
    const html = getHomepageHtml(generatedSite, affiliateLink);
    navigator.clipboard.writeText(html);
    toast({ title: 'Copied to Clipboard!', description: `Homepage HTML has been copied.` });
  }, [generatedSite, affiliateLink, getHomepageHtml, toast]);

  const copyLegalPageHtml = useCallback((content: string, title: string) => {
    if (!generatedSite) return;
    const { theme } = generatedSite;
      
    const themeColorsCss = Object.entries(theme.colors)
        .map(([key, value]) => `    ${key}: ${value};`)
        .join('\n');

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          :root { 
            ${themeColorsCss}
          }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: var(--text-color); max-width: 800px; margin: 0 auto; padding: 20px; background-color: var(--background-color); }
          .container { background-color: var(--card-background); padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          h1, h2 { color: var(--text-color); }
          h1 { font-size: 2.5rem; margin-bottom: 2rem; }
          h2 { font-size: 1.75rem; margin-top: 2.5rem; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;}
        </style>
      </head>
      <body>
        <div class="container">
            <h1>${title}</h1>
            ${toHtml(content)}
        </div>
      </body>
      </html>
    `;
    navigator.clipboard.writeText(fullHtml);
    toast({ title: 'Copied to Clipboard!', description: `${title} page HTML has been copied.` });
  }, [generatedSite, toast]);


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
      return <WebsitePreview site={generatedSite} onCopyHomepage={copyHomepageHtml} onCopyLegal={copyLegalPageHtml} getHomepageHtml={getHomepageHtml} affiliateLink={affiliateLink} />;
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
            The AI will generate a unique homepage and all necessary legal pages for you, embedded with your affiliate link. A new random color theme will be applied with each generation.
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
const WebsitePreview = ({ site, onCopyHomepage, onCopyLegal, getHomepageHtml, affiliateLink }: { site: GenerateWebsiteOutput, onCopyHomepage: () => void, onCopyLegal: (content: string, title: string) => void, getHomepageHtml: (site: GenerateWebsiteOutput, link: string) => string, affiliateLink: string }) => {
    
    const iframeSrcDoc = useMemo(() => {
        if (!site) return '';
        return getHomepageHtml(site, affiliateLink);
    }, [site, affiliateLink, getHomepageHtml]);
    
    return (
    <Tabs defaultValue="preview" className="col-span-full">
        <div className="flex justify-between items-center pr-1">
            <TabsList>
                <TabsTrigger value="preview"><Eye className="mr-2" /> Preview</TabsTrigger>
                <TabsTrigger value="code"><Code className="mr-2" /> Get HTML</TabsTrigger>
            </TabsList>
             <p className="text-sm text-muted-foreground">Theme: <span className="font-semibold text-foreground">{site.theme.name}</span></p>
        </div>

        <TabsContent value="preview">
            <Card className="overflow-hidden">
                <div className="w-full h-[600px] bg-background">
                    <iframe srcDoc={iframeSrcDoc} className="w-full h-full border-0" title="Website Preview" />
                </div>
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
                            <Button variant="outline" size="sm" onClick={onCopyHomepage}><Copy className="mr-2 h-4 w-4"/> Copy HTML</Button>
                        </div>
                        <Textarea readOnly value={`<html>... (Full homepage code for '${site.homepage.title}') ...</html>`} className="font-mono text-xs" rows={3}/>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Terms of Service (terms.html)</h3>
                            <Button variant="outline" size="sm" onClick={() => onCopyLegal(site.terms, 'Terms of Service')}><Copy className="mr-2 h-4 w-4"/> Copy HTML</Button>
                        </div>
                        <Textarea readOnly value={site.terms} className="font-mono text-xs" rows={3}/>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Privacy Policy (privacy.html)</h3>
                             <Button variant="outline" size="sm" onClick={() => onCopyLegal(site.privacy, 'Privacy Policy')}><Copy className="mr-2 h-4 w-4"/> Copy HTML</Button>
                        </div>
                        <Textarea readOnly value={site.privacy} className="font-mono text-xs" rows={3}/>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Earnings Disclaimer (disclaimer.html)</h3>
                            <Button variant="outline" size="sm" onClick={() => onCopyLegal(site.disclaimer, 'Earnings Disclaimer')}><Copy className="mr-2 h-4 w-4"/> Copy HTML</Button>
                        </div>
                        <Textarea readOnly value={site.disclaimer} className="font-mono text-xs" rows={3}/>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
);
}


// Skeleton for loading state
const WebsitePreviewSkeleton = () => (
    <Card className="col-span-full">
        <CardHeader>
            <Skeleton className="h-8 w-1/2" />
        </CardHeader>
        <CardContent>
            <div className="w-full h-[600px] flex items-center justify-center bg-secondary/30 rounded-lg">
                <div className="text-center text-muted-foreground space-y-2">
                    <Loader2 className="w-12 h-12 mx-auto animate-spin" />
                    <p>Building your preview...</p>
                </div>
            </div>
        </CardContent>
    </Card>
);

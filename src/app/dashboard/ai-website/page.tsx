
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/card';
import { useToast } from '@/hooks/use-toast';
import { generateWebsite, type GenerateWebsiteOutput } from '@/ai/flows/website-generator';
import { Loader2, AlertTriangle, Wand2, Copy, Eye, Code, CheckCircle, ArrowRight } from 'lucide-react';
import { useUser } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { websiteThemes, type WebsiteTheme } from '@/lib/data';
import { cn } from '@/lib/utils';


// Skeleton for loading state
const WebsitePreviewSkeleton = () => (
    <Card className="col-span-full">
        <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
            <div className="w-full h-[600px] flex items-center justify-center bg-secondary/30 rounded-lg">
                <div className="text-center text-muted-foreground space-y-2">
                    <Loader2 className="w-12 h-12 mx-auto animate-spin" />
                    <p>Loading generator...</p>
                </div>
            </div>
        </CardContent>
    </Card>
);


// Preview Component (Simplified to remove iframe)
const WebsitePreview = ({ site, onCopyLegal, getHomepageHtml, affiliateLink }: { site: GenerateWebsiteOutput, onCopyLegal: (content: string, title: string) => void, getHomepageHtml: (site: GenerateWebsiteOutput, link: string) => string, affiliateLink: string }) => {
    
    const { toast } = useToast();

    const copyHomepageHtml = useCallback(() => {
        if (!site) return;
        const html = getHomepageHtml(site, affiliateLink);
        navigator.clipboard.writeText(html);
        toast({ title: 'Copied to Clipboard!', description: `Homepage HTML has been copied.` });
    }, [site, affiliateLink, getHomepageHtml, toast]);
    
    return (
        <Card className="col-span-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Your Generated Website Code</CardTitle>
                        <CardDescription>The live preview has been temporarily disabled to resolve a rendering issue. You can still copy the full HTML code for each page below.</CardDescription>
                    </div>
                    <p className="text-sm text-muted-foreground">Theme: <span className="font-semibold text-foreground">{site.theme.name}</span></p>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Homepage (index.html)</h3>
                        <Button variant="outline" size="sm" onClick={copyHomepageHtml}><Copy className="mr-2 h-4 w-4"/> Copy HTML</Button>
                    </div>
                    <Textarea readOnly value={`<html>... (Full homepage code for '${site.homepage.title}') ...</html>`} className="font-mono text-xs bg-secondary" rows={3}/>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Terms of Service (terms.html)</h3>
                        <Button variant="outline" size="sm" onClick={() => onCopyLegal(site.terms, 'Terms of Service')}><Copy className="mr-2 h-4 w-4"/> Copy HTML</Button>
                    </div>
                    <Textarea readOnly value={site.terms} className="font-mono text-xs bg-secondary" rows={3}/>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Privacy Policy (privacy.html)</h3>
                         <Button variant="outline" size="sm" onClick={() => onCopyLegal(site.privacy, 'Privacy Policy')}><Copy className="mr-2 h-4 w-4"/> Copy HTML</Button>
                    </div>
                    <Textarea readOnly value={site.privacy} className="font-mono text-xs bg-secondary" rows={3}/>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Earnings Disclaimer (disclaimer.html)</h3>
                        <Button variant="outline" size="sm" onClick={() => onCopyLegal(site.disclaimer, 'Earnings Disclaimer')}><Copy className="mr-2 h-4 w-4"/> Copy HTML</Button>
                    </div>
                    <Textarea readOnly value={site.disclaimer} className="font-mono text-xs bg-secondary" rows={3}/>
                </div>
            </CardContent>
        </Card>
    );
}


export default function AiWebsitePage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  
  const [generatedSite, setGeneratedSite] = useState<GenerateWebsiteOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<WebsiteTheme | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);
  
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

    if (!selectedTheme) {
        toast({
            variant: 'destructive',
            title: 'Please Select a Theme',
            description: 'You must choose a theme for your website before generating.',
        });
        return;
    }

    setIsLoading(true);
    setGeneratedSite(null);
    setError(null);

    try {
      const result = await generateWebsite({ username: user.displayName, themeName: selectedTheme.name });
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
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            margin: 0; padding: 0; background-color: var(--background-color); color: var(--text-color); 
            line-height: 1.7;
        }
        .container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
        section { padding: 60px 0; }
        @media(min-width: 768px) { section { padding: 80px 0; } }
        h1, h2, h3 { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; font-weight: 700; margin-top: 0; letter-spacing: -0.02em; color: var(--text-color)}
        h1 { font-size: 2.5rem; }
        h2 { font-size: 2.25rem; text-align: center; margin-bottom: 3rem; }
        @media(min-width: 768px) { h1 { font-size: 3.5rem; } h2 { font-size: 2.75rem; } }
        p { margin-top: 0; color: var(--muted-color); }
        a { color: var(--primary-color); text-decoration: none; }
        .btn { display: inline-block; background-color: var(--primary-color); color: white; padding: 14px 28px; font-size: 1rem; font-weight: 600; border-radius: 8px; text-decoration: none; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .btn:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
        
        .dark-theme .btn { color: var(--text-color); }
        .dark-theme .hero .btn, .dark-theme .final-cta .btn { color: var(--text-color); }
        
        /* Header */
        header.main-header {
            position: sticky; top: 0; z-index: 100; border-bottom: 1px solid color-mix(in srgb, var(--border-color, var(--card-background)) 50%, transparent);
            background: color-mix(in srgb, var(--card-background) 80%, transparent);
            backdrop-filter: blur(10px);
        }
        header .container { display: flex; align-items: center; justify-content: space-between; height: 72px; }
        .logo { font-size: 1.25rem; font-weight: 700; color: var(--text-color); }
        .main-nav ul { list-style: none; margin: 0; padding: 0; display: flex; gap: 1.5rem; }
        .main-nav a { font-weight: 500; color: var(--muted-color); transition: color 0.2s; }
        .main-nav a:hover { color: var(--text-color); }

        /* Hero */
        .hero { text-align: center; padding: 80px 0; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; }
        .hero h1 { color: white; }
        .hero p { font-size: 1.1rem; color: rgba(255, 255, 255, 0.9); max-width: 650px; margin: 1.5rem auto 2.5rem; }
        @media(min-width: 768px) { .hero p { font-size: 1.25rem; } }

        /* Sections */
        .section-alt { background-color: var(--card-background); }
        .dark-theme .section-alt { background-color: color-mix(in srgb, var(--background-color) 70%, white); }

        /* Features */
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
        .feature { text-align: center; }
        .feature-icon { font-size: 2rem; margin-bottom: 1rem; line-height: 1; color: var(--primary-color); }
        .feature h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .feature p { font-size: 0.95rem; }

        /* How it Works */
        .steps-grid { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
        @media(min-width: 768px) { .steps-grid { grid-template-columns: repeat(3, 1fr); } }
        .step { display: flex; align-items: flex-start; gap: 1.5rem; text-align: left; }
        .step-number { flex-shrink: 0; width: 40px; height: 40px; background-color: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.25rem; }
        .step h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .step p { margin-bottom: 0; font-size: 0.95rem; }
        
        /* Testimonials */
        .testimonials-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media(min-width: 768px) { .testimonials-grid { grid-template-columns: repeat(3, 1fr); } }
        .testimonial-card { background: var(--card-background); padding: 2rem; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--border-color, var(--card-background)) 50%, transparent); }
        .testimonial-text { font-style: italic; }
        .testimonial-author { margin-top: 1.5rem; }
        .author-name { font-weight: 600; color: var(--text-color); }
        .author-role { font-size: 0.9rem; }

        /* FAQ */
        .faq-container { max-width: 768px; margin: 0 auto; }
        .faq-item { border-bottom: 1px solid color-mix(in srgb, var(--border-color, var(--card-background)) 50%, transparent); padding: 1rem 0; }
        .faq-item summary { font-size: 1.1rem; font-weight: 600; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; color: var(--text-color); }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item summary::after { content: '+'; font-size: 1.5rem; font-weight: 400; transition: transform 0.2s; color: var(--primary-color); }
        .faq-item[open] summary::after { transform: rotate(45deg); }
        .faq-item p { margin-top: 1rem; padding-left: 0.5rem; border-left: 2px solid var(--primary-color); }
        
        /* Final CTA */
        .final-cta { text-align: center; }
        .final-cta p { font-size: 1.1rem; max-width: 650px; margin: 1.5rem auto 2.5rem; }
        @media(min-width: 768px) { .final-cta p { font-size: 1.25rem; } }

        /* Footer */
        footer { padding: 40px 20px; text-align: center; border-top: 1px solid color-mix(in srgb, var(--border-color, var(--card-background)) 50%, transparent); margin-top: 60px; background: var(--card-background); }
        .footer-logo { font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-color); }
        .footer-links { margin-bottom: 1rem; }
        .footer-links a { margin: 0 0.75rem; font-weight: 500; color: var(--muted-color); transition: color 0.2s; }
        .footer-links a:hover { color: var(--text-color); }
        .footer-legal { font-size: 0.8rem; color: #9CA3AF; max-width: 500px; margin: 0.5rem auto 0; }
    </style>
</head>
<body class="${theme.name === 'Midnight Glow' ? 'dark-theme' : 'light-theme'}">

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
            <p class="footer-legal">&copy; <span id="copyright-year"></span>. All rights reserved.</p>
            <p class="footer-legal">This is an independent affiliate website. We may earn a commission from purchases made through links on this site.</p>
        </div>
    </footer>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const el = document.getElementById('copyright-year');
        if (el) el.textContent = new Date().getFullYear();
      });
    </script>
</body>
</html>
    `;
  }, []);

  const toHtml = (content: string) => {
      return content.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p.trim()}</p>`).join('\n');
  }

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
          h2 { font-size: 1.75rem; margin-top: 2.5rem; margin-bottom: 1rem; border-bottom: 1px solid color-mix(in srgb, var(--border-color, var(--card-background)) 50%, transparent); padding-bottom: 0.5rem;}
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


  const renderPreview = () => {
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
      return <WebsitePreview site={generatedSite} onCopyLegal={copyLegalPageHtml} getHomepageHtml={getHomepageHtml} affiliateLink={affiliateLink} />;
    }
    return null; // Should not happen in the new flow
  };

  if (!hasMounted) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">AI Website Generator</h1>
          <p className="text-muted-foreground">
            Instantly create a personalized, high-converting affiliate website.
          </p>
        </div>
        <WebsitePreviewSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI Website Generator</h1>
        <p className="text-muted-foreground">
          Instantly create a personalized, high-converting affiliate website.
        </p>
      </div>

    {!generatedSite ? (
      <>
        <Card>
            <CardHeader>
              <CardTitle>Step 1: Choose a Theme</CardTitle>
              <CardDescription>Select a unique color palette for your new website. This will set the look and feel of your entire site.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {websiteThemes.map((theme) => (
                <div 
                  key={theme.name} 
                  onClick={() => setSelectedTheme(theme)} 
                  className={cn(
                      "cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md", 
                      selectedTheme?.name === theme.name ? "border-primary ring-2 ring-primary shadow-lg" : "border-border"
                  )}
                >
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-foreground">{theme.name}</h3>
                        {selectedTheme?.name === theme.name && <CheckCircle className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex gap-1 h-8 rounded-lg overflow-hidden border">
                        {Object.values(theme.colors).map((color, index) => (
                            <div key={index} style={{ backgroundColor: color }} className="w-full h-full" />
                        ))}
                    </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Step 2: Generate Your Website</CardTitle>
                <CardDescription>
                    Once you have selected a theme, click the button below. The AI will generate a complete, unique website for you with compelling content and all necessary legal pages.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button onClick={handleGenerate} disabled={isLoading || isUserLoading || !selectedTheme}>
                    {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                    <><Wand2 className="mr-2 h-4 w-4" /> Generate Website</>
                    )}
                </Button>
            </CardFooter>
          </Card>
      </>
    ) : (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-headline">Your Generated Website</h2>
                <Button variant="outline" onClick={() => { setGeneratedSite(null); setError(null); }}>
                    Start Over
                </Button>
            </div>
            {renderPreview()}
        </div>
    )}

    </div>
  );
}

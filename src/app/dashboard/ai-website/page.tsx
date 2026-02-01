
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateWebsite, type GenerateWebsiteOutput } from '@/ai/flows/website-generator';
import { Loader2, AlertTriangle, Wand2, Copy, CheckCircle } from 'lucide-react';
import { useUser } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { websiteThemes, type WebsiteTheme } from '@/lib/data';
import { cn } from '@/lib/utils';
import { getHomepageHtml, getLegalPageHtml } from '@/lib/website-html-generator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Component for editing the generated website content
const WebsiteEditor = ({
  site,
  setSite,
}: {
  site: GenerateWebsiteOutput;
  setSite: React.Dispatch<React.SetStateAction<GenerateWebsiteOutput | null>>;
}) => {
  const { toast } = useToast();
  const { user } = useUser();
  const affiliateLink = user?.displayName ? `https://hostproai.com/?ref=${user.displayName.toLowerCase()}` : '#';

  const handleInputChange = (section: keyof GenerateWebsiteOutput['homepage'], index: number | null, field: string, value: string) => {
    setSite(prevSite => {
      if (!prevSite) return null;
  
      // Deep copy to prevent state mutation issues
      const newSite = JSON.parse(JSON.stringify(prevSite));
      
      if (index !== null) {
        // @ts-ignore
        newSite.homepage[section][index][field] = value;
      } else {
        // @ts-ignore
        newSite.homepage[field] = value;
      }
      
      return newSite;
    });
  };
  
   const handleSimpleInputChange = (field: keyof GenerateWebsiteOutput['homepage'], value: string) => {
      setSite(prevSite => {
        if (!prevSite) return null;
        const newSite = JSON.parse(JSON.stringify(prevSite));
        newSite.homepage[field] = value;
        return newSite;
      });
  };
  
  const handleLegalChange = (page: 'terms' | 'privacy' | 'disclaimer', value: string) => {
       setSite(prevSite => {
        if (!prevSite) return null;
        const newSite = JSON.parse(JSON.stringify(prevSite));
        newSite[page] = value;
        return newSite;
      });
  }

  const copyHomepageHtml = useCallback(() => {
    const html = getHomepageHtml(site, affiliateLink);
    navigator.clipboard.writeText(html);
    toast({ title: 'Copied to Clipboard!', description: 'Homepage HTML has been copied.' });
  }, [site, affiliateLink, toast]);

  const copyLegalPageHtml = useCallback((content: string, title: string) => {
    const html = getLegalPageHtml(content, title, site);
    navigator.clipboard.writeText(html);
    toast({ title: 'Copied to Clipboard!', description: `${title} page HTML has been copied.` });
  }, [site, toast]);

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Global Settings</CardTitle>
                <CardDescription>Edit the main title and theme of your website.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div>
                  <Label htmlFor="siteTitle">Website Title</Label>
                  <Input id="siteTitle" value={site.homepage.title} onChange={(e) => handleSimpleInputChange('title', e.target.value)} />
                </div>
                 <div>
                    <Label>Theme</Label>
                    <div className="flex items-center gap-2 rounded-md border p-2 bg-secondary">
                        <div className="flex gap-1 h-6 rounded-md overflow-hidden border w-24">
                             {Object.values(site.theme.colors).map((color, index) => (
                                <div key={index} style={{ backgroundColor: color }} className="w-full h-full" />
                            ))}
                        </div>
                        <span className="font-semibold text-sm">{site.theme.name}</span>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Homepage Content</CardTitle>
                <CardDescription>Edit the content for each section of your homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Hero Section */}
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Hero Section</h3>
                    <div className="space-y-2">
                        <Label htmlFor="headline">Headline</Label>
                        <Input id="headline" value={site.homepage.headline} onChange={(e) => handleSimpleInputChange('headline', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="subheadline">Subheadline</Label>
                        <Textarea id="subheadline" value={site.homepage.subheadline} onChange={(e) => handleSimpleInputChange('subheadline', e.target.value)} rows={2}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ctaButtonText">CTA Button Text</Label>
                        <Input id="ctaButtonText" value={site.homepage.ctaButtonText} onChange={(e) => handleSimpleInputChange('ctaButtonText', e.target.value)} />
                    </div>
                </div>
                
                {/* Features Section */}
                <div className="space-y-4 rounded-lg border p-4">
                     <h3 className="font-semibold">Features Section</h3>
                     <div className="space-y-2">
                        <Label>Section Headline</Label>
                        <Input value={site.homepage.featuresHeadline} onChange={(e) => handleSimpleInputChange('featuresHeadline', e.target.value)} />
                    </div>
                    {site.homepage.features.map((feature, index) => (
                        <div key={index} className="space-y-2 p-3 bg-secondary/50 rounded-md">
                             <Label>Feature {index + 1}</Label>
                             <Input placeholder="Icon (Emoji)" value={feature.icon} onChange={(e) => handleInputChange('features', index, 'icon', e.target.value)} />
                             <Input placeholder="Title" value={feature.title} onChange={(e) => handleInputChange('features', index, 'title', e.target.value)} />
                             <Textarea placeholder="Description" value={feature.description} onChange={(e) => handleInputChange('features', index, 'description', e.target.value)} rows={2}/>
                        </div>
                    ))}
                </div>

                 {/* Testimonials Section */}
                <div className="space-y-4 rounded-lg border p-4">
                     <h3 className="font-semibold">Testimonials Section</h3>
                     <div className="space-y-2">
                        <Label>Section Headline</Label>
                        <Input value={site.homepage.testimonialsHeadline} onChange={(e) => handleSimpleInputChange('testimonialsHeadline', e.target.value)} />
                    </div>
                    {site.homepage.testimonials.map((testimonial, index) => (
                        <div key={index} className="space-y-2 p-3 bg-secondary/50 rounded-md">
                             <Label>Testimonial {index + 1}</Label>
                             <Textarea placeholder="Text" value={testimonial.text} onChange={(e) => handleInputChange('testimonials', index, 'text', e.target.value)} rows={3}/>
                             <Input placeholder="Name" value={testimonial.name} onChange={(e) => handleInputChange('testimonials', index, 'name', e.target.value)} />
                             <Input placeholder="Role" value={testimonial.role} onChange={(e) => handleInputChange('testimonials', index, 'role', e.target.value)} />
                        </div>
                    ))}
                </div>
                
                {/* FAQ Section */}
                <div className="space-y-4 rounded-lg border p-4">
                     <h3 className="font-semibold">FAQ Section</h3>
                      <div className="space-y-2">
                        <Label>Section Headline</Label>
                        <Input value={site.homepage.faqHeadline} onChange={(e) => handleSimpleInputChange('faqHeadline', e.target.value)} />
                    </div>
                    {site.homepage.faqs.map((faq, index) => (
                        <div key={index} className="space-y-2 p-3 bg-secondary/50 rounded-md">
                            <Label>FAQ {index + 1}</Label>
                            <Input placeholder="Question" value={faq.question} onChange={(e) => handleInputChange('faqs', index, 'question', e.target.value)} />
                            <Textarea placeholder="Answer" value={faq.answer} onChange={(e) => handleInputChange('faqs', index, 'answer', e.target.value)} rows={3} />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Legal Pages</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Terms of Service</Label>
                    <Textarea value={site.terms} onChange={(e) => handleLegalChange('terms', e.target.value)} rows={5} />
                </div>
                <div className="space-y-2">
                    <Label>Privacy Policy</Label>
                    <Textarea value={site.privacy} onChange={(e) => handleLegalChange('privacy', e.target.value)} rows={5} />
                </div>
                <div className="space-y-2">
                    <Label>Disclaimer</Label>
                    <Textarea value={site.disclaimer} onChange={(e) => handleLegalChange('disclaimer', e.target.value)} rows={5} />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Export Your Website</CardTitle><CardDescription>Once you are happy with your content, copy the HTML for each page.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex justify-between items-center p-3 border rounded-lg">
                    <p className="font-semibold">Homepage (index.html)</p>
                    <Button variant="outline" size="sm" onClick={copyHomepageHtml}><Copy className="mr-2 h-4 w-4"/> Copy HTML</Button>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                    <p className="font-semibold">Terms of Service (terms.html)</p>
                    <Button variant="outline" size="sm" onClick={() => copyLegalPageHtml(site.terms, 'Terms of Service')}><Copy className="mr-2 h-4 w-4"/> Copy HTML</Button>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                    <p className="font-semibold">Privacy Policy (privacy.html)</p>
                     <Button variant="outline" size="sm" onClick={() => copyLegalPageHtml(site.privacy, 'Privacy Policy')}><Copy className="mr-2 h-4 w-4"/> Copy HTML</Button>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                    <p className="font-semibold">Earnings Disclaimer (disclaimer.html)</p>
                    <Button variant="outline" size="sm" onClick={() => copyLegalPageHtml(site.disclaimer, 'Earnings Disclaimer')}><Copy className="mr-2 h-4 w-4"/> Copy HTML</Button>
                </div>
            </CardContent>
        </Card>

    </div>
  );
};


// Main page component
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

  const handleGenerate = async () => {
    if (!user?.displayName) {
      toast({ variant: 'destructive', title: 'Username Not Found', description: 'We couldn\'t find your username.' });
      return;
    }
    if (!selectedTheme) {
      toast({ variant: 'destructive', title: 'Please Select a Theme' });
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
      const errorMessage = e instanceof Error ? e.message : 'An unexpected problem occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderContent = () => {
    if (!hasMounted || isUserLoading) {
      return (
        <Card><CardHeader><CardTitle>Loading Generator...</CardTitle></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
      );
    }
    
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Generating Your Website...</CardTitle>
                    <CardDescription>The AI is crafting your content. This may take a moment.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-20">
                    <Loader2 className="w-16 h-16 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
         return (
            <Card>
            <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle /> Generation Failed</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive"><AlertTitle>An error occurred.</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
                <Button variant="outline" onClick={() => { setGeneratedSite(null); setError(null); }} className="mt-4">Start Over</Button>
            </CardContent>
            </Card>
        );
    }

    if (generatedSite) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold font-headline">Edit Your Website</h2>
                    <Button variant="outline" onClick={() => { setGeneratedSite(null); setError(null); }}>Start Over</Button>
                </div>
                <WebsiteEditor site={generatedSite} setSite={setGeneratedSite} />
            </div>
        );
    }

    // Default view: theme selection
    return (
      <>
        <Card>
            <CardHeader><CardTitle>Step 1: Choose a Theme</CardTitle><CardDescription>Select a color palette for your new website.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {websiteThemes.map((theme) => (
                <div key={theme.name} onClick={() => setSelectedTheme(theme)} className={cn("cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md", selectedTheme?.name === theme.name ? "border-primary ring-2 ring-primary shadow-lg" : "border-border")}>
                    <div className="flex justify-between items-center mb-3"><h3 className="font-semibold text-foreground">{theme.name}</h3>{selectedTheme?.name === theme.name && <CheckCircle className="h-5 w-5 text-primary" />}</div>
                    <div className="flex gap-1 h-8 rounded-lg overflow-hidden border">{Object.values(theme.colors).map((color, index) => (<div key={index} style={{ backgroundColor: color }} className="w-full h-full" />))}</div>
                </div>
              ))}
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Step 2: Generate Your Website</CardTitle><CardDescription>Once you select a theme, the AI will generate unique content for you.</CardDescription></CardHeader>
            <CardFooter>
                <Button onClick={handleGenerate} disabled={isLoading || isUserLoading || !selectedTheme}><Wand2 className="mr-2 h-4 w-4" /> Generate Website</Button>
            </CardFooter>
        </Card>
      </>
    );
  };

  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold font-headline">AI Website Generator</h1><p className="text-muted-foreground">Create and customize your personalized affiliate website.</p></div>
      {renderContent()}
    </div>
  );
}


'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/card';
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
const WebsitePreview = ({ 
    site,
    onCopyHomepage,
    onCopyLegal,
}: { 
    site: GenerateWebsiteOutput,
    onCopyHomepage: () => void,
    onCopyLegal: (content: string, title: string) => void,
}) => {
    return (
        <Card className="col-span-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Your Generated Website Code</CardTitle>
                        <CardDescription>The live preview has been temporarily disabled. Copy the full HTML code for each page below.</CardDescription>
                    </div>
                    <p className="text-sm text-muted-foreground">Theme: <span className="font-semibold text-foreground">{site.theme.name}</span></p>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Homepage (index.html)</h3>
                        <Button variant="outline" size="sm" onClick={onCopyHomepage}><Copy className="mr-2 h-4 w-4"/> Copy HTML</Button>
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

  const copyHomepageHtml = useCallback(() => {
    if (!generatedSite) return;
    const html = getHomepageHtml(generatedSite, affiliateLink);
    navigator.clipboard.writeText(html);
    toast({ title: 'Copied to Clipboard!', description: `Homepage HTML has been copied.` });
  }, [generatedSite, affiliateLink, toast]);

  const copyLegalPageHtml = useCallback((content: string, title: string) => {
    if (!generatedSite) return;
    const html = getLegalPageHtml(content, title, generatedSite);
    navigator.clipboard.writeText(html);
    toast({ title: 'Copied to Clipboard!', description: `${title} page HTML has been copied.` });
  }, [generatedSite, toast]);
  
  const renderContent = () => {
    if (!hasMounted || isUserLoading) {
      return <WebsitePreviewSkeleton />;
    }

    if (generatedSite) {
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
                    <Button variant="outline" onClick={() => { setGeneratedSite(null); setError(null); }} className="mt-4">
                        Start Over
                    </Button>
                </CardContent>
                </Card>
            );
        }
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold font-headline">Your Generated Website</h2>
                    <Button variant="outline" onClick={() => { setGeneratedSite(null); setError(null); }}>
                        Start Over
                    </Button>
                </div>
                <WebsitePreview 
                    site={generatedSite}
                    onCopyHomepage={copyHomepageHtml}
                    onCopyLegal={copyLegalPageHtml}
                />
            </div>
        );
    }

    // Default view: theme selection
    return (
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
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI Website Generator</h1>
        <p className="text-muted-foreground">
          Instantly create a personalized, high-converting affiliate website.
        </p>
      </div>
      {renderContent()}
    </div>
  );
}

    
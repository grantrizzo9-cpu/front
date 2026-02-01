'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateWebsite, type GenerateWebsiteOutput } from '@/ai/flows/website-generator';
import { Loader2, AlertTriangle, Wand2, Copy, CheckCircle, UploadCloud } from 'lucide-react';
import { useUser } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { websiteThemes, type WebsiteTheme } from '@/lib/data';
import { cn } from '@/lib/utils';
import { getHomepageHtml } from '@/lib/website-html-generator';

// Preview Component
const WebsitePreview = ({ site, affiliateLink }: { site: GenerateWebsiteOutput, affiliateLink: string }) => {
    const [previewHtml, setPreviewHtml] = useState('');

    useEffect(() => {
        // Generate the HTML for the preview
        const html = getHomepageHtml(site, affiliateLink);
        setPreviewHtml(html);
    }, [site, affiliateLink]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Live Website Preview</CardTitle>
                <CardDescription>This is a fully interactive preview of your generated homepage.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full aspect-[16/9] border rounded-lg overflow-hidden bg-white">
                    <iframe
                        srcDoc={previewHtml}
                        title="Website Preview"
                        className="w-full h-full"
                        sandbox="allow-scripts allow-same-origin allow-modals"
                    />
                </div>
            </CardContent>
        </Card>
    );
};


// Export Component with instructions
const ExportWebsite = ({ site, affiliateLink }: { site: GenerateWebsiteOutput, affiliateLink: string }) => {
    const { toast } = useToast();

    const copyHtml = useCallback(() => {
        const html = getHomepageHtml(site, affiliateLink);
        navigator.clipboard.writeText(html);
        toast({ title: 'Copied to Clipboard!', description: `Your website's HTML has been copied.` });
    }, [site, affiliateLink, toast]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Export Your Website</CardTitle>
                <CardDescription>Copy the complete HTML for your single-page website.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex justify-between items-center p-3 border rounded-lg">
                    <p className="font-semibold">Your Website</p>
                    <Button variant="outline" size="sm" onClick={copyHtml}><Copy className="mr-2 h-4 w-4"/> Copy index.html</Button>
                </div>
            </CardContent>
            <CardFooter>
                 <Alert>
                    <UploadCloud className="h-4 w-4" />
                    <AlertTitle>How to Go Live</AlertTitle>
                    <AlertDescription>
                        After copying the code, create a file named `index.html` on your computer. Paste the copied code into this file and save it. Finally, upload this single `index.html` file to your web hosting provider to make your website visible to the world.
                    </AlertDescription>
                </Alert>
            </CardFooter>
        </Card>
    );
};


// Main page component
export default function AiWebsitePage() {
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
      // This should ideally not happen if the user is on this page.
      alert('Could not find your username.');
      return;
    }
    if (!selectedTheme) {
      alert('Please select a theme.');
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
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold font-headline">Your Generated Website</h2>
                    <Button variant="outline" onClick={() => { setGeneratedSite(null); setError(null); }}>Start Over</Button>
                </div>
                <WebsitePreview site={generatedSite} affiliateLink={affiliateLink} />
                <ExportWebsite site={generatedSite} affiliateLink={affiliateLink} />
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
      <div><h1 className="text-3xl font-bold font-headline">AI Website Generator</h1><p className="text-muted-foreground">Create your personalized affiliate website in just two steps.</p></div>
      {renderContent()}
    </div>
  );
}

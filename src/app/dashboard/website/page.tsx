
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateWebsite, type GenerateWebsiteOutput } from '@/ai/flows/website-generator';
import { Loader2, AlertTriangle, Wand2, CheckCircle, UploadCloud } from 'lucide-react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { websiteThemes, type WebsiteTheme } from '@/lib/data';
import { cn } from '@/lib/utils';
import { getHomepageHtml } from '@/lib/website-html-generator';
import type { Website, User as UserType } from '@/lib/types';
import { collection, query, limit, doc } from 'firebase/firestore';
import Link from 'next/link';

// Component to show when a site is published
const PublishedSite = ({ site, user, onRegenerate }: { site: Website, user: UserType | null, onRegenerate: () => void }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CheckCircle className="text-green-500"/> Your Website is Live!</CardTitle>
                <CardDescription>Your generated website content has been published.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Alert>
                    <UploadCloud className="h-4 w-4" />
                    <AlertTitle>Next Steps: Automatic Deployment</AlertTitle>
                    <AlertDescription>
                        This dashboard provides the user interface for one-click deployment. To make this fully functional, a backend process needs to be implemented to take the saved content and upload it to your hosting provider (like Firebase Hosting). This step is not yet automated.
                    </AlertDescription>
                </Alert>
                {user?.customDomain?.name ? (
                     <div className="p-4 border rounded-lg">
                        <p className="text-sm font-medium">Your live domain:</p>
                        <Link href={`https://${user.customDomain.name}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary text-lg hover:underline">
                            {`https://${user.customDomain.name}`}
                        </Link>
                    </div>
                ) : (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>No Custom Domain Configured</AlertTitle>
                        <AlertDescription>
                            You haven't set up a custom domain yet. Go to the <Link href="/dashboard/hosting" className="font-semibold underline">Hosting</Link> page to connect your domain.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter>
                 <Button onClick={onRegenerate} variant="outline">
                    <Wand2 className="mr-2 h-4 w-4" /> Re-generate Website
                </Button>
            </CardFooter>
        </Card>
    );
};


// Component to preview and deploy a generated site
const Deployer = ({ site, affiliateLink, onDeploy, onCancel }: { site: GenerateWebsiteOutput, affiliateLink: string, onDeploy: () => void, onCancel: () => void }) => {
    const [previewHtml, setPreviewHtml] = useState('');

    useEffect(() => {
        const html = getHomepageHtml(site, affiliateLink);
        setPreviewHtml(html);
    }, [site, affiliateLink]);
    
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Step 2: Preview & Deploy</CardTitle>
                    <CardDescription>This is a fully interactive preview of your generated homepage. When you are ready, deploy it.</CardDescription>
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
             <Card>
                <CardHeader>
                    <CardTitle>Ready to Go Live?</CardTitle>
                    <CardDescription>This will publish the generated content as your live website.</CardDescription>
                </CardHeader>
                <CardFooter className="gap-2">
                     <Button onClick={onDeploy} size="lg">
                        <UploadCloud className="mr-2 h-4 w-4"/> Deploy Website
                    </Button>
                    <Button onClick={onCancel} size="lg" variant="outline">
                        Cancel
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};


// Main page component
export default function WebsiteBuilderPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  // State for the generation process
  const [generatedSite, setGeneratedSite] = useState<GenerateWebsiteOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // Used for both generating and deploying
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<WebsiteTheme | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  // --- Fetch user's existing website data ---
  const websitesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'websites'), limit(1));
  }, [user, firestore]);
  
  const { data: userWebsites, isLoading: isLoadingWebsite } = useCollection<Website>(websitesQuery);
  const publishedSite = userWebsites?.[0] || null;

  const affiliateLink = user?.displayName ? `https://hostproai.com/?ref=${user.displayName.toLowerCase()}` : '#';

  const handleGenerate = async () => {
    if (!user?.displayName) {
      toast({ variant: 'destructive', title: 'Username not found', description: 'Could not find your username to generate the site.' });
      return;
    }
    if (!selectedTheme) {
      toast({ variant: 'destructive', title: 'No theme selected', description: 'Please select a theme before generating.' });
      return;
    }
    setIsProcessing(true);
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
      setIsProcessing(false);
    }
  };
  
  const handleDeploy = () => {
    if (!user || !generatedSite || !firestore) return;
    
    setIsProcessing(true); // Show loading state

    const websiteData = {
        userId: user.uid,
        themeName: generatedSite.theme.name,
        content: generatedSite, // Storing the full generator output
        status: 'published' as const,
        updatedAt: new Date(),
    };
    
    if (publishedSite) {
        const docRef = doc(firestore, 'users', user.uid, 'websites', publishedSite.id);
        updateDocumentNonBlocking(docRef, websiteData);
    } else {
        const collectionRef = collection(firestore, 'users', user.uid, 'websites');
        addDocumentNonBlocking(collectionRef, { ...websiteData, createdAt: new Date() });
    }
    
    setTimeout(() => {
        toast({ title: 'Deployment Started!', description: 'Your website content has been published.'});
        setGeneratedSite(null);
        setIsProcessing(false);
    }, 1500);
  };
  
  const handleStartOver = () => {
      setGeneratedSite(null);
      setError(null);
      if(publishedSite && firestore && user) {
          const docRef = doc(firestore, 'users', user.uid, 'websites', publishedSite.id);
          updateDocumentNonBlocking(docRef, { status: 'draft' });
      }
  }
  
  const isLoading = isUserLoading || isLoadingWebsite || isUserDataLoading;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div><h1 className="text-3xl font-bold font-headline">My Website</h1><p className="text-muted-foreground">Manage your one-click affiliate website.</p></div>
        <Card><CardHeader><CardTitle>Loading Your Website...</CardTitle></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  // Show published view if one exists and we are not in the middle of generating/deploying
  if (publishedSite && publishedSite.status === 'published' && !generatedSite && !isProcessing) {
      return (
          <div className="space-y-8">
            <div><h1 className="text-3xl font-bold font-headline">My Website</h1><p className="text-muted-foreground">Manage your one-click affiliate website.</p></div>
            <PublishedSite 
                site={publishedSite}
                user={userData}
                onRegenerate={handleStartOver}
            />
        </div>
      );
  }
    
  if (generatedSite && !isProcessing) {
     return (
        <div className="space-y-8">
            <div><h1 className="text-3xl font-bold font-headline">My Website</h1><p className="text-muted-foreground">Manage your one-click affiliate website.</p></div>
             <Deployer site={generatedSite} affiliateLink={affiliateLink} onDeploy={handleDeploy} onCancel={handleStartOver} />
        </div>
    );
  }
  
  if (isProcessing) {
      return (
        <div className="space-y-8">
            <div><h1 className="text-3xl font-bold font-headline">My Website</h1><p className="text-muted-foreground">Manage your one-click affiliate website.</p></div>
            <Card>
                <CardHeader><CardTitle>{generatedSite ? 'Deploying...' : 'Generating...'}</CardTitle><CardDescription>Please wait a moment.</CardDescription></CardHeader>
                <CardContent className="flex justify-center items-center py-20"><Loader2 className="w-16 h-16 animate-spin text-primary" /></CardContent>
            </Card>
        </div>
      )
  }
    
  if (error) {
     return (
         <div className="space-y-8">
            <div><h1 className="text-3xl font-bold font-headline">My Website</h1><p className="text-muted-foreground">Manage your one-click affiliate website.</p></div>
            <Card>
                <CardHeader><CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle /> Generation Failed</CardTitle></CardHeader>
                <CardContent><Alert variant="destructive"><AlertTitle>An error occurred.</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></CardContent>
                <CardFooter><Button variant="outline" onClick={() => setError(null)}>Start Over</Button></CardFooter>
            </Card>
        </div>
    );
  }

  // Default view: theme selection
  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold font-headline">Create Your Website</h1><p className="text-muted-foreground">Generate and deploy your personalized affiliate website in just a few clicks.</p></div>
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
            <CardFooter>
                <Button onClick={handleGenerate} disabled={isProcessing || !selectedTheme}>
                    <Wand2 className="mr-2 h-4 w-4" /> Generate & Preview Website
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}

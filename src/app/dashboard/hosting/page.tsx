
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { Loader2, Globe, Info, CheckCircle, AlertTriangle, Search, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { RegistrarLogo } from '@/components/registrar-logo';
import { firebaseConfig } from '@/firebase/config';

export default function HostingPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [domainInput, setDomainInput] = useState('');
    const [domainToSearch, setDomainToSearch] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    const [localDomainStatus, setLocalDomainStatus] = useState<'unconfigured' | 'pending' | 'connected' | 'error' | null>(null);

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user?.uid]);

    const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

    useEffect(() => {
        if (userData?.customDomain?.status) {
            setLocalDomainStatus(userData.customDomain.status);
        } else {
            setLocalDomainStatus('unconfigured');
        }
        if (userData?.customDomain?.name) {
            setDomainInput(userData.customDomain.name);
        }
    }, [userData?.customDomain]);

    const isLoading = isUserLoading || isUserDataLoading;

    const handleDomainSearch = () => {
        if (!domainToSearch) {
            toast({ variant: 'destructive', title: 'Please enter a domain to search.'});
            return;
        }
        // This will open the user's reseller storefront with the domain pre-filled for searching.
        window.open(`https://rizzosai.shopco.com/site/availability/${domainToSearch}`, '_blank');
    };

    const handleSaveDomain = () => {
        if (!userDocRef || !domainInput) return;

        if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domainInput)) {
            toast({
                variant: 'destructive',
                title: 'Invalid Domain',
                description: 'Please enter a valid domain name (e.g., yoursite.com).',
            });
            return;
        }

        setIsSaving(true);
        const newDomainData = {
            name: domainInput,
            status: 'pending' as const,
        };

        setLocalDomainStatus('pending');
        
        updateDocumentNonBlocking(userDocRef, { customDomain: newDomainData });
        
        setTimeout(() => {
            toast({
                title: 'Domain Saved',
                description: `Your domain ${domainInput} is now pending verification. Follow the steps below.`,
            });
            setIsSaving(false);
        }, 1000);
    };
    
    const hostingConsoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/hosting/custom-domains`;

    if (isLoading && localDomainStatus === null) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
             <div>
                <h1 className="text-3xl font-bold font-headline">Your Custom Domain</h1>
                <p className="text-muted-foreground">This is your gateway to building a professional brand. A custom domain makes you look serious and helps you build a long-term asset.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</div>
                            <CardTitle>Find Your Brand Name</CardTitle>
                        </div>
                        <RegistrarLogo />
                    </div>
                    <CardDescription>
                        Use your integrated domain store to find and register the perfect domain. This is a professional GoDaddy reseller store, and you earn a commission on every sale.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            id="domain-search"
                            placeholder="your-awesome-site.com"
                            value={domainToSearch}
                            onChange={(e) => setDomainToSearch(e.target.value)}
                        />
                        <Button onClick={handleDomainSearch}>
                            <Search className="mr-2 h-4 w-4" /> Search
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                         <CardTitle>Connect Your Registered Domain</CardTitle>
                    </div>
                    <CardDescription>
                       After purchasing your domain through your store, enter it here to begin the connection process.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            id="domain"
                            placeholder="your-awesome-site.com"
                            value={domainInput}
                            onChange={(e) => setDomainInput(e.target.value)}
                            disabled={isSaving || localDomainStatus === 'connected'}
                        />
                        <Button onClick={handleSaveDomain} disabled={isSaving || !domainInput || localDomainStatus === 'connected'}>
                            {isSaving ? <Loader2 className="animate-spin" /> : 'Save Domain'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className={!domainInput ? "opacity-50 pointer-events-none" : ""}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                         <CardTitle>Point Your Domain to the Host</CardTitle>
                    </div>
                    <CardDescription>
                       To take your site live, you'll need to update its DNS records at your registrar (your ShopCo store).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <p className="text-sm text-muted-foreground">
                        This is a technical but crucial step that connects your domain name (e.g., your-site.com) to our high-performance hosting servers. You only have to do this once.
                    </p>
                    <Alert className="border-primary/50">
                        <Globe className="h-4 w-4" />
                        <AlertTitle>Start Here: Go to Hosting Console</AlertTitle>
                        <AlertDescription>
                            This is your project's Google Hosting console. Click "Add custom domain" and follow the wizard. It will give you the DNS records (a TXT record first, then two A records) you need for the next step.
                            <Button asChild variant="default" className="mt-2 w-full">
                                <Link href={hostingConsoleUrl} target="_blank" rel="noopener noreferrer">
                                    Open Hosting Console
                                </Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                    <Alert>
                        <BookOpen className="h-4 w-4" />
                        <AlertTitle>Need Help? Read the Full Guide</AlertTitle>
                        <AlertDescription>
                            We have a detailed, step-by-step guide with screenshots that walks you through this entire process. We recommend opening this in a new tab for reference.
                             <Button asChild variant="link" className="p-0 h-auto font-semibold">
                                <Link href="/dashboard/guides">
                                    Click here to read the "Pre-Launch Checklist" guide.
                                </Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">4</div>
                         <CardTitle>Final Status</CardTitle>
                    </div>
                    <CardDescription>
                        This status reflects the information saved in our app. For live status, always check the Hosting Console.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center gap-4 py-8">
                     {(() => {
                        const status = localDomainStatus;
                        switch (status) {
                            case 'pending':
                                return (
                                    <>
                                        <Badge className="bg-amber-500 text-white hover:bg-amber-500">Pending Verification</Badge>
                                        <p className="text-sm text-muted-foreground max-w-sm">
                                            The system is waiting for your DNS records to be updated and verified. This can take a few hours. Check the Hosting Console for live status.
                                        </p>
                                    </>
                                );
                            case 'connected':
                                return (
                                    <>
                                        <Badge className="bg-green-500 text-white hover:bg-green-500">Connected</Badge>
                                        <div className="w-full max-w-md">
                                            <Alert className="text-left border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                <AlertTitle className="text-green-800 dark:text-green-200">Congratulations!</AlertTitle>
                                                <AlertDescription className="text-green-700 dark:text-green-300">
                                                    Your domain is successfully connected and your site should be live at <a href={`https://{domainInput}`} target="_blank" rel="noopener noreferrer" className="font-semibold underline">{domainInput}</a>.
                                                </AlertDescription>
                                            </Alert>
                                        </div>
                                    </>
                                );
                            case 'error':
                                return (
                                    <>
                                        <Badge variant="destructive">Error</Badge>
                                        <p className="text-sm text-destructive max-w-sm">
                                            Something went wrong. Please try saving your domain again or contact support.
                                        </p>
                                    </>
                                );
                            default:
                                return (
                                    <>
                                        <Badge variant="secondary">Unconfigured</Badge>
                                        <p className="text-sm text-muted-foreground max-w-sm">
                                            Complete Step 1 and 2 to begin the domain setup process.
                                        </p>
                                    </>
                                );
                        }
                    })()}
                </CardContent>
            </Card>
        </div>
    );
}

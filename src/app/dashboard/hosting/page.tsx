
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
import { Loader2, Globe, Info, CheckCircle, AlertTriangle, Search, BookOpen, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { RegistrarLogo } from '@/components/registrar-logo';
import { firebaseConfig } from '@/firebase/config';
import { useAdmin } from '@/hooks/use-admin';

export default function HostingPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const { isPlatformOwner, isLoading: isAdminLoading } = useAdmin();

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

    const isLoading = isUserLoading || isUserDataLoading || isAdminLoading;

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
                title: 'Domain Request Submitted',
                description: `Your request for ${domainInput} has been sent for setup.`,
            });
            setIsSaving(false);
        }, 1000);
    };
    
    const hostingConsoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/hosting/custom-domains`;


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    // Platform Owner View
    if (isPlatformOwner) {
        return (
            <div className="space-y-8 max-w-4xl">
                 <div>
                    <h1 className="text-3xl font-bold font-headline">Manage Custom Domains (Admin)</h1>
                    <p className="text-muted-foreground">As the platform owner, you use this interface to connect domains for your users.</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</div>
                                <CardTitle>User Purchases a Domain</CardTitle>
                            </div>
                            <RegistrarLogo />
                        </div>
                        <CardDescription>
                            Your users will purchase a domain through your integrated reseller store.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                             <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                             <CardTitle>User Submits Domain for Setup</CardTitle>
                        </div>
                        <CardDescription>
                           After purchase, the user submits their domain name in their dashboard. You will then receive a notification to configure it.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                             <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                             <CardTitle>You Connect the Domain</CardTitle>
                        </div>
                        <CardDescription>
                           To take a user's site live, you must add their domain here and update the DNS records at the registrar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <p className="text-sm text-muted-foreground">
                            This process connects their domain name to our hosting servers. You only have to do this once per user domain.
                        </p>
                        <Alert className="border-primary/50">
                            <Globe className="h-4 w-4" />
                            <AlertTitle>Start Here: Go to Hosting Console</AlertTitle>
                            <AlertDescription>
                                This link opens your project's Google Hosting console. When prompted, you must **log in with the Google Account that owns the Firebase project**. After logging in, click "Add custom domain" and follow the wizard to get your DNS records.
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
                                For a detailed walkthrough, read the "Pre-Launch Checklist" guide, which has screenshots for this process.
                                 <Button asChild variant="link" className="p-0 h-auto font-semibold">
                                    <Link href="/dashboard/guides">
                                        Click here to read the guide.
                                    </Link>
                                </Button>
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    // Regular User/Admin View
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
                            <CardTitle>Find & Purchase Your Domain</CardTitle>
                        </div>
                        <RegistrarLogo />
                    </div>
                    <CardDescription>
                        Use our integrated domain store to find and register the perfect domain for your brand.
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
                            <Search className="mr-2 h-4 w-4" /> Search for Domain
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                         <CardTitle>Submit Your Domain for Setup</CardTitle>
                    </div>
                    <CardDescription>
                       After purchasing your domain, enter it here and save it. Our team will handle the technical setup.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            id="domain"
                            placeholder="your-purchased-domain.com"
                            value={domainInput}
                            onChange={(e) => setDomainInput(e.target.value)}
                            disabled={isSaving || localDomainStatus === 'connected'}
                        />
                        <Button onClick={handleSaveDomain} disabled={isSaving || !domainInput || localDomainStatus === 'connected'}>
                            {isSaving ? <Loader2 className="animate-spin" /> : <Send />}
                            {localDomainStatus === 'connected' ? 'Domain Saved' : 'Save & Request Setup'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                         <CardTitle>Connection Status</CardTitle>
                    </div>
                    <CardDescription>
                        This status will update once our team has configured your domain.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center gap-4 py-8">
                     {(() => {
                        const status = localDomainStatus;
                        switch (status) {
                            case 'pending':
                                return (
                                    <>
                                        <Badge className="bg-amber-500 text-white hover:bg-amber-500">Pending Setup</Badge>
                                        <p className="text-sm text-muted-foreground max-w-sm">
                                            Your request has been submitted. Our team will now connect your domain. This can take up to 24 hours. You will be notified when it's live.
                                        </p>
                                    </>
                                );
                            case 'connected':
                                return (
                                    <>
                                        <Badge className="bg-green-500 text-white hover:bg-green-500">Connected & Live!</Badge>
                                        <div className="w-full max-w-md">
                                            <Alert className="text-left border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                <AlertTitle className="text-green-800 dark:text-green-200">Congratulations!</AlertTitle>
                                                <AlertDescription className="text-green-700 dark:text-green-300">
                                                    Your domain is successfully connected and your website is now live at <a href={`https://{domainInput}`} target="_blank" rel="noopener noreferrer" className="font-semibold underline">{domainInput}</a>.
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
                                            Something went wrong with the setup. Please ensure the domain name is correct and try saving again. If the problem persists, contact support.
                                        </p>
                                    </>
                                );
                            default:
                                return (
                                    <>
                                        <Badge variant="secondary">Unconfigured</Badge>
                                        <p className="text-sm text-muted-foreground max-w-sm">
                                            Complete Step 1 and 2 to request your custom domain setup.
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

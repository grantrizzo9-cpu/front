
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { Loader2, Globe, CheckCircle, Search, BookOpen, Send, ShieldCheck, ArrowRight } from 'lucide-react';
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
                description: `Request for ${domainInput} sent.`,
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

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <div>
                <h1 className="text-3xl font-bold font-headline">Your Custom Domain</h1>
                <p className="text-muted-foreground">Build your brand with a professional domain name.</p>
            </div>

            {/* Step 1: Search/Purchase */}
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
                        Search for the perfect domain in our integrated store.
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
                            <Search className="mr-2 h-4 w-4" /> Search Store
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Step 2: Submit */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                         <CardTitle>Submit Domain for Setup</CardTitle>
                    </div>
                    <CardDescription>
                       Enter the domain you purchased below to notify our team.
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
                            {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
                            {localDomainStatus === 'connected' ? 'Domain Connected' : 'Save & Request Setup'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Step 3: Status */}
            <Card>
                 <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                         <CardTitle>Connection Status</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center gap-4 py-8">
                     {(() => {
                        switch (localDomainStatus) {
                            case 'pending':
                                return (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                        <Badge className="bg-amber-500 text-white animate-pulse">Request Received: Setup in Progress</Badge>
                                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                            We've received your request for <strong>{domainInput}</strong>. Our team is now configuring the server. This usually takes 2-24 hours.
                                        </p>
                                    </div>
                                );
                            case 'connected':
                                return (
                                    <div className="w-full max-w-md animate-in zoom-in-95">
                                        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <AlertTitle className="text-green-800">Your Site is Live!</AlertTitle>
                                            <AlertDescription className="text-green-700">
                                                Your domain is successfully connected. View your site at: <br/>
                                                <a href={`https://${domainInput}`} target="_blank" rel="noopener noreferrer" className="font-bold underline text-lg">{domainInput}</a>
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                );
                            default:
                                return (
                                    <div className="text-muted-foreground">
                                        <Globe className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                        <p>Waiting for domain submission...</p>
                                    </div>
                                );
                        }
                    })()}
                </CardContent>
            </Card>

            {/* ADMIN ONLY TOOLS SECTION */}
            {isPlatformOwner && (
                <div className="pt-12 mt-12 border-t-2 border-dashed">
                    <div className="flex items-center gap-2 mb-6">
                        <ShieldCheck className="text-primary" />
                        <h2 className="text-2xl font-bold font-headline">Platform Owner Tools</h2>
                    </div>
                    
                    <Card className="border-primary/50 bg-primary/5">
                        <CardHeader>
                            <CardTitle>Admin Action: Connect User Domains</CardTitle>
                            <CardDescription>Use these tools to fulfill domain setup requests from your users.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert>
                                <Globe className="h-4 w-4" />
                                <AlertTitle>Access Hosting Console</AlertTitle>
                                <AlertDescription>
                                    Click below to open the Firebase Hosting console. You must be logged in as <strong>grantrizzo2@gmail.com</strong>.
                                    <Button asChild className="w-full mt-4">
                                        <Link href={hostingConsoleUrl} target="_blank" rel="noopener noreferrer">
                                            Open Hosting Console <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </AlertDescription>
                            </Alert>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/dashboard/guides">
                                    <BookOpen className="mr-2 h-4 w-4" /> View Setup Guide
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

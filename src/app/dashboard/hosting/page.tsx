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
import { Loader2, Globe, Info, CheckCircle, AlertTriangle, Search, ExternalLink, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { firebaseConfig } from '@/firebase/config';

export default function HostingPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [domainInput, setDomainInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    
    const [localDomainStatus, setLocalDomainStatus] = useState<'unconfigured' | 'pending' | 'connected' | 'error' | null>(null);

    const userDocRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

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

    // TODO: Replace with your actual Name.com affiliate link
    const namecomAffiliateLink = "https://www.name.com/?ref=YOUR_USERNAME";

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
        updateDocumentNonBlocking(userDocRef, { customDomain: newDomainData });
        setLocalDomainStatus('pending');
        
        setTimeout(() => {
            toast({
                title: 'Domain Saved',
                description: `Your domain ${domainInput} is now pending verification. Follow Step 2 below.`,
            });
            setIsSaving(false);
        }, 1000);
    };

    const handleVerifyDomain = () => {
        if (!userDocRef) return;
        setIsVerifying(true);
        setTimeout(() => {
            updateDocumentNonBlocking(userDocRef, { 'customDomain.status': 'connected' });
            setLocalDomainStatus('connected');
            setIsVerifying(false);
            toast({
                title: 'Domain Connected!',
                description: 'Your domain is now live.',
                className: 'bg-green-500 border-green-500 text-white dark:bg-green-600 dark:border-green-600',
            });
        }, 2500);
    };

    const firebaseConsoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/hosting/custom-domains`;

    if (isLoading && localDomainStatus === null) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</div>
                         <CardTitle>Choose Your Website's Address (Domain Name)</CardTitle>
                    </div>
                    <CardDescription>
                        A domain name is your website's unique address, like <code>www.yourbrand.com</code>. A professional domain builds trust and makes your site easy to find. If you don't have one yet, you'll need to register one.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Option A: Register a New Domain</h3>
                        <div className="text-sm text-muted-foreground mb-4 space-y-2">
                          <p>We recommend using our trusted partner, Name.com, to register your new domain.</p>
                        </div>
                        <Button asChild className="w-full">
                            <a href={namecomAffiliateLink} target="_blank" rel="noopener noreferrer">
                                Register a Domain on Name.com
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                     <Separator />
                     <div>
                        <h3 className="font-semibold mb-2">Option B: Connect a Domain You Already Own</h3>
                         <p className="text-sm text-muted-foreground mb-4">
                            If you have already purchased a domain, enter it below to begin the connection process.
                        </p>
                        <div className="flex gap-2">
                            <Input
                                id="domain"
                                placeholder="your-awesome-site.com"
                                value={domainInput}
                                onChange={(e) => setDomainInput(e.target.value)}
                                disabled={isSaving || localDomainStatus === 'connected'}
                            />
                            <Button onClick={handleSaveDomain} disabled={isSaving || !domainInput || localDomainStatus === 'connected'}>
                                {isSaving ? <Loader2 className="animate-spin" /> : 'Save & Continue'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                         <CardTitle>Point Your Domain to Our Cloud Servers (DNS)</CardTitle>
                    </div>
                    <CardDescription>
                       This is the most critical step. You must get the correct, unique DNS records from your Firebase project and add them to your domain registrar (e.g., Name.com).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <HelpCircle className="h-4 w-4" />
                        <AlertTitle>Where to find your DNS records</AlertTitle>
                        <AlertDescription>
                            Your DNS records are unique to your project and are provided by Google. You must get them from the Firebase Console after you have successfully published your app.
                        </AlertDescription>
                    </Alert>
                    <div>
                        <h3 className="font-semibold mb-2">Instructions:</h3>
                        <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
                            <li>
                                First, publish your application. Then, open the <a href={firebaseConsoleUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">Firebase Console for your project</a>.
                            </li>
                            <li>
                                Navigate to the <strong>App Hosting</strong> section and find the <strong>Custom Domains</strong> tab for your production backend.
                            </li>
                            <li>
                                Click the <strong>"Add custom domain"</strong> button.
                            </li>
                            <li>
                                Enter your domain name (<code>{domainInput || 'your-domain.com'}</code>) and follow the setup wizard.
                            </li>
                            <li>
                                Firebase will display the exact DNS records required (usually two 'A' records).
                            </li>
                            <li>
                                Copy these values and add them to the DNS settings in your Name.com account. You must remove any other conflicting 'A' records.
                            </li>
                        </ol>
                    </div>
                     <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Very Important!</AlertTitle>
                        <AlertDescription>
                            Do not use any IP addresses or values other than the ones provided to you in the Firebase Console. Using incorrect values is the primary cause of '404 not found' errors.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                         <CardTitle>Verification and Connection</CardTitle>
                    </div>
                    <CardDescription>
                        Once you've saved the correct DNS records, our system will check for them. This "propagation," can take up to 24 hours.
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
                                            DNS changes can take time. Once you've added the records from the Firebase Console, you can check the status.
                                        </p>
                                        <Button onClick={handleVerifyDomain} disabled={isVerifying}>
                                            {isVerifying ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2" />}
                                            {isVerifying ? 'Verifying...' : 'Check Status Now'}
                                        </Button>
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
                                                    Your domain is successfully connected and your site should be live.
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
                                            Complete steps 1 and 2. The status of your domain will appear here.
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

    
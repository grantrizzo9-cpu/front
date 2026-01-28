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
import { Loader2, Globe, Info, CheckCircle, AlertTriangle, Search, ExternalLink, HelpCircle, ArrowRight } from 'lucide-react';
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

    const firebaseConsoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/hosting/custom-domains`;

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

    const handleVerifyDomain = () => {
        if (!userDocRef) return;
        setIsVerifying(true);
        setTimeout(() => {
            // In a real app, this would re-fetch status from a backend that checks DNS.
            // For now, we simulate a successful check. The user must manually verify in the Firebase Console.
            setIsVerifying(false);
            toast({
                title: 'Verification Status',
                description: 'Please check the Firebase Console to see the live status of your domain connection. This button only simulates a check.',
            });
        }, 2500);
    };

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
                <h1 className="text-3xl font-bold font-headline">Custom Domain</h1>
                <p className="text-muted-foreground">Connect your custom domain to build a professional affiliate website.</p>
            </div>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Seeing a "Site Not Found" error on your domain?</AlertTitle>
                <AlertDescription>
                    This is a normal part of the setup process! It means your domain is pointing to Firebase, but you haven't finished the configuration inside the Firebase Console yet. <strong>Follow Step 2 carefully to fix this.</strong>
                </AlertDescription>
            </Alert>
            
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</div>
                         <CardTitle>Enter Your Domain</CardTitle>
                    </div>
                    <CardDescription>
                        First, you need a domain name. If you don't have one, you can register one at a registrar like <a href="https://name.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Name.com</a>. Once you have your domain, enter it here.
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
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                         <CardTitle>Configure DNS in the Firebase Console</CardTitle>
                    </div>
                    <CardDescription>
                       This is the most important step to fix the "Site Not Found" error. You must add your domain in the Firebase Console to get your unique verification and DNS records.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <h3 className="font-semibold">Instructions:</h3>
                    <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
                        <li>
                            Click this link to open the Firebase Console for your project: <a href={firebaseConsoleUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold">Open Firebase Hosting</a>.
                        </li>
                        <li>
                            Click the <strong>"Add custom domain"</strong> button.
                        </li>
                        <li>
                            Enter your domain name (<code>{domainInput || 'your-domain.com'}</code>) in the wizard.
                        </li>
                        <li>
                           Firebase will give you a <strong>TXT record</strong> for verification. Copy this value.
                        </li>
                        <li>
                            Go to your domain registrar (e.g., Name.com) and add this TXT record to your domain's DNS settings.
                        </li>
                         <li>
                            Once Firebase verifies the TXT record (this can take a few minutes to a few hours), it will show you the <strong>A records</strong> you need.
                        </li>
                         <li>
                            Go back to your registrar and add the two A records provided by Firebase. Make sure to remove any other A records to avoid conflicts.
                        </li>
                    </ol>
                     <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Critical Step!</AlertTitle>
                        <AlertDescription>
                            You must use the exact record values provided by Firebase in the console. Using incorrect values is the main cause of connection issues.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                 <CardFooter>
                     <p className="text-xs text-muted-foreground">
                         <strong>Alternative:</strong> If you don't want to build a website and just want to forward your domain to your affiliate link, you can do this in your domain registrar's settings (look for "URL Forwarding").
                     </p>
                 </CardFooter>
            </Card>

            <Card>
                 <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                         <CardTitle>Final Verification</CardTitle>
                    </div>
                    <CardDescription>
                        After you've added the DNS records at your registrar, it can take up to 24 hours for them to "propagate" across the internet. Once complete, your site will be live.
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
                                            The system is waiting for you to complete the DNS setup in the Firebase Console and at your domain registrar.
                                        </p>
                                         <Button onClick={handleVerifyDomain} disabled={isVerifying}>
                                            {isVerifying ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2" />}
                                            {isVerifying ? 'Checking...' : 'Check Status'}
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
                                                    Your domain is successfully connected and your site should be live at <a href={`http://${domainInput}`} target="_blank" rel="noopener noreferrer" className="font-semibold underline">{domainInput}</a>.
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
                                            Complete Step 1 to begin the domain setup process.
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

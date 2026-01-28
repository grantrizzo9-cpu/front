
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
import { Loader2, Globe, Info, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</div>
                         <CardTitle>Enter Your Domain</CardTitle>
                    </div>
                    <CardDescription>
                       Enter the domain name you own. You can buy one from any registrar, like <a href="https://name.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Name.com</a> or Google Domains.
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
                         <CardTitle>Connect Your Domain in Firebase</CardTitle>
                    </div>
                    <CardDescription>
                       Follow the setup wizard in the Firebase Console. This is a two-part process: first verifying ownership, then going live.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold">Step 2A: Verify Domain Ownership (TXT Record)</h3>
                        <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
                            <li>
                                Click this link and click <strong>"Add custom domain"</strong>: <a href={firebaseConsoleUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline font-semibold">Open Firebase Hosting</a>.
                            </li>
                            <li>
                                Enter your domain name (<code>{domainInput || 'your-domain.com'}</code>). Firebase will show you a **TXT record** (e.g., `hosting-site=...`). Copy this value.
                            </li>
                            <li>
                                In your domain registrar (e.g., Namecheap), create a new **TXT record** for your main domain (use `@` for the host).
                            </li>
                            <li>
                                Paste the value you copied from Firebase into the record's "Value" field and save.
                            </li>
                            <li>
                                Wait a few minutes for the record to update online, then return to the Firebase Console and click **"Verify"**.
                            </li>
                        </ol>
                         <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>This is the Most Common Sticking Point!</AlertTitle>
                            <AlertDescription>
                                If verification fails, wait a little longer. DNS changes can sometimes take up to an hour to propagate across the internet.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold">Step 2B: Go Live (A Records)</h3>
                        <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
                             <li>
                                After your domain is verified, the Firebase Console will show you **two `A` records**. These are IP addresses that point to your website.
                            </li>
                            <li>
                                Go back to your domain registrar's DNS settings.
                            </li>
                            <li>
                                **Delete** any existing `A` records for your main domain (`@`).
                            </li>
                            <li>
                                Create **two new `A` records**, one for each IP address that Firebase provided. The host for both should be `@`.
                            </li>
                            <li>
                                Once you save these, Firebase will begin provisioning an SSL certificate. Your site will be live at your custom domain once this is complete.
                            </li>
                        </ol>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                         <CardTitle>Final Status</CardTitle>
                    </div>
                    <CardDescription>
                        This status reflects the information saved in our app. For live status, always check the Firebase Console.
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
                                            The system is waiting for your DNS records to be verified by Firebase. Check the Firebase Console for the live status.
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

    

    

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { Loader2, Globe, Copy, Info, CheckCircle, AlertTriangle, Search, ExternalLink, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

function DnsRecordRow({ type, name, value }: { type: string, name: string, value: string }) {
    const { toast } = useToast();
    const onCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied to clipboard!' });
    };
    return (
        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-md text-sm">
            <div className="flex items-center gap-4 font-mono">
                <Badge variant="outline" className="w-16 flex-shrink-0 justify-center">{type}</Badge>
                <span className="w-16">{name}</span>
                <span className="truncate">{value}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => onCopy(value)}>
                <Copy className="h-4 w-4" />
            </Button>
        </div>
    );
}

export default function HostingPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [domainInput, setDomainInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const userDocRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

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
        // Simulate a network delay for verification
        setTimeout(() => {
            updateDocumentNonBlocking(userDocRef, { 'customDomain.status': 'connected' });
            setIsVerifying(false);
            toast({
                title: 'Domain Connected!',
                description: 'Your domain is now live.',
                className: 'bg-green-500 border-green-500 text-white dark:bg-green-600 dark:border-green-600',
            });
        }, 2500);
    };

    if (isLoading) {
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
                        Think of a domain name as your website's unique street address on the internet, like <code>www.yourbrand.com</code>. A professional domain builds trust and makes your site easy for people to find. If you don't have one yet, you'll need to register one. If you already own one, you can connect it in Option B below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Option A: Register a New Domain</h3>
                        <div className="text-sm text-muted-foreground mb-4 space-y-2">
                          <p>We recommend using our trusted partner, Name.com, to register your new domain. They make the process simple and secure.</p>
                          <p className="font-medium text-foreground">Tips for choosing a great domain name:</p>
                          <ul className="list-disc pl-5 text-xs">
                              <li>Keep it short, memorable, and easy to spell.</li>
                              <li>Try to use a <strong>.com</strong> if possible, as it's the most recognized.</li>
                              <li>Avoid numbers and hyphens to prevent confusion.</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-secondary/50 rounded-lg space-y-4">
                             <Button asChild className="w-full">
                                <a href={namecomAffiliateLink} target="_blank" rel="noopener noreferrer">
                                    Register a Domain on Name.com
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                             </Button>
                        </div>
                    </div>
                     <Separator />
                     <div>
                        <h3 className="font-semibold mb-2">Option B: Connect a Domain You Already Own</h3>
                         <p className="text-sm text-muted-foreground mb-4">
                            If you have already purchased a domain from any registrar (like GoDaddy, Namecheap, or Name.com), enter it below to begin the connection process.
                        </p>
                        <div className="flex gap-2">
                            <Input
                                id="domain"
                                placeholder="your-awesome-site.com"
                                defaultValue={userData?.customDomain?.name || ''}
                                onChange={(e) => setDomainInput(e.target.value)}
                                disabled={isSaving || userData?.customDomain?.status === 'connected'}
                            />
                            <Button onClick={handleSaveDomain} disabled={isSaving || !domainInput || userData?.customDomain?.status === 'connected'}>
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
                       This next step is like telling the internet's main directory where your website lives. You'll log in to your domain registrar (where you bought your domain, like Name.com) and give it the "address" of our powerful cloud servers. This is done by editing something called DNS Records.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <HelpCircle className="h-4 w-4" />
                        <AlertTitle>What are DNS Records?</AlertTitle>
                        <AlertDescription>
                            DNS stands for "Domain Name System". Think of it as the phonebook of the internet. When you type <code>www.yourbrand.com</code> into a browser, DNS looks up the correct server to connect to. You just need to update this "phonebook entry" for your domain to point to us.
                        </AlertDescription>
                    </Alert>
                    <div>
                        <h3 className="font-semibold mb-2">Your Required DNS Records</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Log in to your Name.com (or other registrar) account. Find the section called "DNS Management" or "Manage DNS Records" for your domain. You may need to delete any existing 'A' or 'CNAME' records for your main domain before adding these new ones to avoid conflicts.
                        </p>
                        <div className="space-y-3">
                            <div>
                                <p className="font-mono text-sm mb-1"><strong>A Record:</strong> <span className="text-muted-foreground">Points your main domain (e.g., <code>yourbrand.com</code>) to our server's address.</span></p>
                                <DnsRecordRow type="A Record" name="@" value="74.125.132.121" />
                            </div>
                            <div>
                                <p className="font-mono text-sm mb-1"><strong>CNAME Record:</strong> <span className="text-muted-foreground">Ensures the 'www' version of your address also works.</span></p>
                                <DnsRecordRow type="CNAME Record" name="www" value={domainInput || userData?.customDomain?.name || 'your-site.com'} />
                            </div>
                        </div>
                    </div>
                     <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Very Important!</AlertTitle>
                        <AlertDescription>
                            You must remove any other "A" or "CNAME" records for your root domain (the one with the name "@" or "yourbrand.com") to avoid conflicts and ensure your site loads correctly.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                         <CardTitle className="flex justify-between items-center">
                            <span>Verification and Connection</span>
                         </CardTitle>
                    </div>
                    <CardDescription>
                        Once you've saved your DNS records, our system will start checking for them. This process, called "propagation," can take some time.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center gap-4 py-8">
                     {(() => {
                        const status = userData?.customDomain?.status;

                        switch (status) {
                            case 'pending':
                                return (
                                    <>
                                        <Badge className="bg-amber-500 text-white hover:bg-amber-500">Pending Verification</Badge>
                                        <p className="text-sm text-muted-foreground max-w-sm">
                                            DNS changes can take up to 24 hours to propagate. You can manually check the status now.
                                        </p>
                                        <Button onClick={handleVerifyDomain} disabled={isVerifying}>
                                            {isVerifying ? (
                                                <Loader2 className="animate-spin mr-2" />
                                            ) : (
                                                <Search className="mr-2" />
                                            )}
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
                                                    Your domain is successfully connected and should be live shortly.
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
                            default: // This handles null, undefined, and 'unconfigured'
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

    
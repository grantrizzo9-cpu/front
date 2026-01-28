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
import { Loader2, Globe, Copy, Info, CheckCircle, AlertTriangle, Search, ExternalLink } from 'lucide-react';
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

    const StatusBadge = () => {
        if (!userData?.customDomain || !userData.customDomain.name) {
            return <Badge variant="secondary">Unconfigured</Badge>;
        }
        switch (userData.customDomain.status) {
            case 'pending':
                return <Badge className="bg-amber-500 text-white">Pending Verification</Badge>;
            case 'connected':
                return <Badge className="bg-green-500 text-white">Connected</Badge>;
            case 'error':
                 return <Badge variant="destructive">Error</Badge>;
            default:
                return <Badge variant="secondary">Unconfigured</Badge>;
        }
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
            <div>
                <h1 className="text-3xl font-bold font-headline">Hosting & Custom Domains</h1>
                <p className="text-muted-foreground">Connect a professional domain name to your brand.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</div>
                         <CardTitle>Get Your Domain Name</CardTitle>
                    </div>
                    <CardDescription>
                        A custom domain (e.g., `your-brand.com`) is essential for a professional identity.
                        You can register a new one or connect one you already own.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Option A: Register a New Domain</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            We recommend registering your domain with <strong>Name.com</strong>.
                            Use our partner link to get the best prices and support our platform.
                        </p>
                        <div className="p-4 bg-secondary/50 rounded-lg space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="your-new-brand.com"
                                    disabled
                                />
                                <Button disabled>
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>
                            </div>
                             <p className="text-xs text-center text-muted-foreground">Domain search and registration directly from your dashboard is coming soon!</p>
                             <Separator />
                             <Button asChild className="w-full">
                                <a href={namecomAffiliateLink} target="_blank" rel="noopener noreferrer">
                                    Register on Name.com
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                             </Button>
                        </div>
                    </div>
                     <Separator />
                     <div>
                        <h3 className="font-semibold mb-2">Option B: Connect a Domain You Already Own</h3>
                         <p className="text-sm text-muted-foreground mb-4">
                            If you already have a domain, enter it here to begin the connection process.
                        </p>
                        <div className="flex gap-2">
                            <Input
                                id="domain"
                                placeholder="your-awesome-site.com"
                                defaultValue={userData?.customDomain?.name || ''}
                                onChange={(e) => setDomainInput(e.target.value)}
                                disabled={isSaving}
                            />
                            <Button onClick={handleSaveDomain} disabled={isSaving || !domainInput}>
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
                         <CardTitle>Connect Your Domain to Our Servers</CardTitle>
                    </div>
                    <CardDescription>
                        To connect your domain, log in to your domain registrar (e.g., Name.com, GoDaddy) and add the following two records. This points your domain to our high-performance cloud servers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <DnsRecordRow type="A Record" name="@" value="74.125.132.121" />
                    <DnsRecordRow type="CNAME Record" name="www" value={domainInput || userData?.customDomain?.name || 'your-site.com'} />
                     <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Important!</AlertTitle>
                        <AlertDescription>
                            You must remove any other "A" or "CNAME" records for your root domain (@) to avoid conflicts.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                         <CardTitle className="flex justify-between items-center">
                            <span>Verification Status</span>
                         </CardTitle>
                    </div>
                    <CardDescription>
                        We'll automatically detect when your DNS changes are complete.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center gap-4">
                     <StatusBadge />
                     <p className="text-sm text-muted-foreground max-w-sm">
                        DNS changes can take up to 24 hours to propagate across the internet. We will check periodically and update the status here.
                     </p>
                </CardContent>
            </Card>
        </div>
    );
}

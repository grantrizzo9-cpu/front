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
import { Loader2, Globe, Copy, Info, CheckCircle, AlertTriangle, BookOpen, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
                description: `Your domain ${domainInput} is now pending verification.`,
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
                <h1 className="text-3xl font-bold font-headline">Hosting & Domains</h1>
                <p className="text-muted-foreground">Connect your custom domain to present a professional brand to your audience.</p>
            </div>
            
            <Alert className="border-accent/50 bg-accent/5">
              <BookOpen className="h-4 w-4 text-accent" />
              <AlertTitle className="text-accent font-semibold">New to Domains?</AlertTitle>
              <AlertDescription>
                Check out our detailed guide on how to choose, register, and connect your domain for a professional online identity.
                <Button asChild variant="link" className="p-0 h-auto ml-1 text-accent">
                    <Link href="/dashboard/guides">Go to Marketing Guides</Link>
                </Button>
              </AlertDescription>
            </Alert>
            
            <Card>
                <CardHeader>
                    <CardTitle>Register a New Domain</CardTitle>
                    <CardDescription>Find and register a new domain name for your brand. (Feature coming soon)</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Connect Your Existing Domain</span>
                        <StatusBadge />
                    </CardTitle>
                    <CardDescription>
                       Already own a domain? Connect it here.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Label htmlFor="domain">Enter Your Domain Name</Label>
                    <div className="flex gap-2">
                        <Input
                            id="domain"
                            placeholder="your-awesome-site.com"
                            defaultValue={userData?.customDomain?.name || ''}
                            onChange={(e) => setDomainInput(e.target.value)}
                            disabled={isSaving}
                        />
                        <Button onClick={handleSaveDomain} disabled={isSaving || !domainInput}>
                            {isSaving ? <Loader2 className="animate-spin" /> : 'Save'}
                        </Button>
                    </div>
                </CardContent>
                 <CardFooter className="text-sm text-muted-foreground">
                    After saving, proceed to the DNS setup below.
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>DNS Setup Instructions</CardTitle>
                    <CardDescription>
                        To connect your domain, log in to your domain registrar (e.g., Name.com, GoDaddy) and add the following two records.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <DnsRecordRow type="A Record" name="@" value="74.125.132.121" />
                    <DnsRecordRow type="CNAME Record" name="www" value={userData?.customDomain?.name || 'your-site.com'} />
                     <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Important!</AlertTitle>
                        <AlertDescription>
                            You must remove any other "A" records for your root domain (@) to avoid conflicts. DNS changes can take up to 24 hours to propagate.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    );
}

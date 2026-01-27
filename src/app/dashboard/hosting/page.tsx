
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
import { Loader2, Globe, Copy, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function DnsRecordRow({ type, name, value }: { type: string, name: string, value: string }) {
    const { toast } = useToast();
    const onCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied to clipboard!' });
    };
    return (
        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-md text-sm">
            <div className="flex items-center gap-4 font-mono">
                <Badge variant="outline" className="w-12 flex-shrink-0 justify-center">{type}</Badge>
                <span className="hidden sm:inline">{name}</span>
                <span className="sm:hidden">@</span>
                <span>{value}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopy(value)}>
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

        // Basic validation for domain format
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
        
        // Simulate saving delay
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
                <h1 className="text-3xl font-bold font-headline">Hosting &amp; Domains</h1>
                <p className="text-muted-foreground">Connect your custom domain to present a professional brand to your audience.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Your Custom Domain</span>
                        <StatusBadge />
                    </CardTitle>
                    <CardDescription>
                        {userData?.customDomain?.name
                            ? `Your domain is set to ${userData.customDomain.name}.`
                            : 'You have not configured a custom domain yet.'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Label htmlFor="domain">Enter Domain Name</Label>
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
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>DNS Setup Instructions</CardTitle>
                    <CardDescription>
                        To connect your domain, log in to your domain registrar (e.g., GoDaddy, Namecheap) and add the following two records.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Important!</AlertTitle>
                        <AlertDescription>
                            Your website is hosted on Google's high-performance cloud infrastructure. The records below will point your domain to our servers.
                            Make sure to remove any other "A" or "CNAME" records for your root domain to avoid conflicts.
                        </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                        <DnsRecordRow type="A" name="@" value="74.125.132.121" />
                        <DnsRecordRow type="CNAME" name="www" value={userData?.customDomain?.name || 'your-site.com'} />
                    </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-4 text-sm text-muted-foreground">
                    <p>DNS changes can take up to 24 hours to propagate, but it's usually much faster. Once propagated, the status above will change to "Connected".</p>
                    <p>If you need help, consult the "Using Your Own Domain" guide on the Marketing Guides page or your domain registrar's support documents.</p>
                </CardFooter>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle>Alternative: Domain Forwarding</CardTitle>
                    <CardDescription>
                        If you don't want to host a site, you can forward your domain directly to your affiliate link.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>This is a simpler but less professional option. In your domain registrar's settings, choose "Forwarding" and set the destination to your full affiliate link (e.g., <code>https://affiliateai.host/?ref={userData?.username || 'you'}</code>).</p>
                     <p><strong>Note:</strong> With this method, visitors will see the affiliateai.host URL in their browser bar. For better branding and trust, we strongly recommend the DNS setup method above.</p>
                </CardContent>
            </Card>

        </div>
    );
}

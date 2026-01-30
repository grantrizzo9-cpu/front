
'use client';

import { Suspense, useState, useEffect } from 'react';
import { SignupForm } from './signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Next.js replaces this with the actual value at build time.
const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

function LoadingSignupForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Create Your Account</CardTitle>
                <CardDescription>Loading your plan details...</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function SignupPage() {
    const [isClient, setIsClient] = useState(false);

    // This effect ensures that the component only attempts to render
    // the PayPal provider after it has mounted on the client.
    useEffect(() => {
        setIsClient(true);
    }, []);

    // While waiting for the client to mount, show a loading state.
    // This prevents any server-side rendering of the PayPal provider.
    if (!isClient) {
        return <LoadingSignupForm />;
    }

    // Once on the client, check for the PayPal Client ID.
    // If it's missing or a placeholder, show a clear error message.
    if (!paypalClientId || paypalClientId.includes('REPLACE_WITH')) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Signup Unavailable</CardTitle>
                    <CardDescription>Account creation is temporarily disabled.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Payment Service Not Configured</AlertTitle>
                        <AlertDescription>
                            The application owner needs to configure the PayPal Client ID. Please add your `NEXT_PUBLIC_PAYPAL_CLIENT_ID` to the `.env` file and **restart the development server** for the change to take effect.
                        </AlertDescription>
                    </Alert>
                    <Button variant="link" asChild className="mt-4">
                         <Link href="/login">Already have an account? Log in</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }
    
    // Only if we are on the client AND the key is valid do we render the PayPal provider.
    // This is the only safe way to prevent the page from crashing.
    return (
         <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "AUD", intent: "capture" }}>
            <Suspense fallback={<LoadingSignupForm />}>
                <SignupForm />
            </Suspense>
        </PayPalScriptProvider>
    );
}

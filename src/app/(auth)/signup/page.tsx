
'use client';

import { Suspense } from 'react';
import { SignupForm } from './signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// It's important to read this env var here, at the top level of the component.
const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

// A loading component to show while the form is loading
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

    // This is the critical check. If the PayPal ID isn't valid, we show an error and
    // NEVER attempt to render the PayPalScriptProvider, which prevents the crash.
    // The check is more robust, looking for falsy values (like an empty string) too.
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
                            The application owner needs to configure the PayPal Client ID in the environment variables to enable new signups. Please add your `NEXT_PUBLIC_PAYPAL_CLIENT_ID` to the `.env` file.
                        </AlertDescription>
                    </Alert>
                    <Button variant="link" asChild className="mt-4">
                         <Link href="/login">Already have an account? Log in</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }
    
    // Only if the paypalClientId is valid do we proceed to render the provider.
    return (
         <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "AUD", intent: "capture" }}>
            <Suspense fallback={<LoadingSignupForm />}>
                <SignupForm />
            </Suspense>
        </PayPalScriptProvider>
    );
}

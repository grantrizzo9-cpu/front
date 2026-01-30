
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

/**
 * This is a "gatekeeper" component. It ensures that any code that needs the browser
 * (like accessing environment variables or loading PayPal) only runs after the
 * component has safely "mounted" on the client. This prevents server/client
 * mismatches (hydration errors) that cause a blank screen.
 */
function SignupPageContent() {
    const [isClient, setIsClient] = useState(false);

    // This effect runs only in the browser, after the initial render.
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Until we're sure we are on the client, we render a loading state.
    // This matches what the server renders, preventing a crash.
    if (!isClient) {
        return <LoadingSignupForm />;
    }

    // Now that we are on the client, we can safely access browser-only things
    // like environment variables.
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    // Check if the PayPal Client ID is missing or is a placeholder.
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
        );
    }
    
    // If the keys are present, we can now safely render the PayPal provider.
    return (
        <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "AUD", intent: "capture" }}>
            <SignupForm />
        </PayPalScriptProvider>
    );
}


export default function SignupPage() {
  // The <Suspense> wrapper is necessary because the SignupForm component
  // uses `useSearchParams` to read the plan from the URL.
  return (
    <Suspense fallback={<LoadingSignupForm />}>
      <SignupPageContent />
    </Suspense>
  );
}

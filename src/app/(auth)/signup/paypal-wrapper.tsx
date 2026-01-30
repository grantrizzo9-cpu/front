
'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { PayPalPaymentButton } from "@/components/paypal-payment-button";
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { SubscriptionTier } from "@/lib/types";

interface PayPalWrapperProps {
    plan: SubscriptionTier;
    isProcessing: boolean;
    paypalClientId: string;
    onPaymentSuccess: (details: any) => Promise<void>;
    onPaymentStart: () => void;
    onPaymentError: () => void;
}

export function PayPalWrapper({ plan, isProcessing, paypalClientId, onPaymentSuccess, onPaymentStart, onPaymentError }: PayPalWrapperProps) {
    const isPaypalConfigured = paypalClientId && !paypalClientId.includes('REPLACE_WITH');

    if (!isPaypalConfigured) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Payment Service Not Configured</AlertTitle>
                <AlertDescription>
                    The application owner needs to configure the PayPal Client ID. Please add your `NEXT_PUBLIC_PAYPAL_CLIENT_ID` to the `.env` file and **restart the development server**.
                </AlertDescription>
            </Alert>
        );
    }
    
    return (
        <div className="relative">
            {isProcessing && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 rounded-md">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">Processing payment...</p>
                </div>
            )}
             <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "AUD", intent: "capture" }}>
                <PayPalPaymentButton 
                    planId={plan.id}
                    onPaymentSuccess={onPaymentSuccess}
                    onPaymentStart={onPaymentStart}
                    onPaymentError={onPaymentError}
                    disabled={isProcessing}
                />
            </PayPalScriptProvider>
        </div>
    );
}

    
'use client';

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { createPaypalOrder, capturePaypalOrder } from '@/app/actions/paypal-actions';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';

interface PayPalPaymentButtonProps {
    planId: string;
    onPaymentSuccess: (details: any) => Promise<void>;
    onPaymentStart: () => void;
    onPaymentError: () => void;
    disabled: boolean;
}

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

export function PayPalPaymentButton({ planId, onPaymentSuccess, onPaymentStart, onPaymentError, disabled }: PayPalPaymentButtonProps) {
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // This ensures the component only renders on the client side,
        // preventing hydration errors and crashes from server-side rendering attempts.
        setIsClient(true);
    }, []);

    if (!isClient) {
        // Show a skeleton loader while waiting for the client to mount.
        return <Skeleton className="h-11 w-full" />;
    }
    
    if (!clientId || clientId.includes('REPLACE_WITH')) {
        return (
            <div className="text-center p-4 rounded-md border border-destructive bg-destructive/10 text-destructive text-sm">
                <p className="font-bold">Payments are currently disabled.</p>
                <p>The PayPal Client ID is missing. The app owner needs to add it to the environment configuration.</p>
            </div>
        )
    }

    const handleCreateOrder = async () => {
        onPaymentStart();
        const result = await createPaypalOrder(planId);
        if (result.error || !result.orderId) {
            toast({
                variant: 'destructive',
                title: 'PayPal Error',
                description: result.error || 'Could not create a PayPal order. Please refresh and try again.',
            });
            onPaymentError();
            throw new Error(result.error || 'Could not create PayPal order.');
        }
        return result.orderId;
    };

    const handleOnApprove = async (data: { orderID: string }, actions: any) => {
        const result = await capturePaypalOrder(data.orderID);

        if (result.success && result.orderData) {
            toast({
                title: 'Payment Successful!',
                description: "We're now creating your account...",
            });
            await onPaymentSuccess(result.orderData);
        } else {
            toast({
                variant: 'destructive',
                title: 'Payment Failed',
                description: result.error || 'An error occurred while processing your payment. You have not been charged.',
            });
            onPaymentError();
        }
    };
    
    const onError = (err: any) => {
        toast({
            variant: "destructive",
            title: "PayPal Error",
            description: "An unexpected error occurred with the PayPal transaction. Please check your details and try again.",
        });
        onPaymentError();
    }

    return (
        <PayPalScriptProvider options={{ clientId: clientId, currency: "AUD", intent: "capture" }}>
            <PayPalButtons
                style={{ layout: "vertical", label: "pay", tagline: false, height: 44 }}
                createOrder={handleCreateOrder}
                onApprove={handleOnApprove}
                onError={onError}
                disabled={disabled}
                forceReRender={[planId, disabled]}
            />
        </PayPalScriptProvider>
    );
}

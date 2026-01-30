'use client';

import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { createPaypalOrder, capturePaypalOrder } from '@/app/actions/paypal-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface PayPalPaymentButtonProps {
    planId: string;
    onPaymentSuccess: (details: any) => Promise<void>;
    onPaymentStart: () => void;
    onPaymentError: (error: string) => void;
    disabled: boolean;
}

export function PayPalPaymentButton({ planId, onPaymentSuccess, onPaymentStart, onPaymentError, disabled }: PayPalPaymentButtonProps) {
    const { toast } = useToast();
    const [{ isPending, isRejected }] = usePayPalScriptReducer();

    useEffect(() => {
        if (isRejected) {
             const errorMessage = 'The PayPal script failed to load. This can be caused by an invalid Client ID in your .env file, a network issue, or an ad blocker. Please verify your NEXT_PUBLIC_PAYPAL_CLIENT_ID and restart the server.';
             toast({
                variant: 'destructive',
                title: 'PayPal Script Load Error',
                description: errorMessage,
                duration: 10000,
            });
            onPaymentError(errorMessage);
        }
    }, [isRejected, toast, onPaymentError]);


    const handleCreateOrder = async (): Promise<string> => {
        onPaymentStart();
        try {
            const result = await createPaypalOrder(planId);

            if (!result) {
                const errorMessage = "The server returned an empty or invalid response. This indicates a critical server issue.";
                onPaymentError(errorMessage);
                return Promise.reject(new Error(errorMessage));
            }

            if (result.error || result.debug) {
                const errorMessage = `PayPal order creation failed: ${result.error}. ${result.debug ? `(Debug: ${result.debug})` : ''}`;
                onPaymentError(errorMessage);
                return Promise.reject(new Error(errorMessage));
            }

            if (!result.orderId) {
                const errorMessage = "The server did not return a PayPal order ID, even though it reported success.";
                onPaymentError(errorMessage);
                return Promise.reject(new Error(errorMessage));
            }

            return result.orderId;

        } catch (error: any) {
            const errorMessage = `A client-server communication error occurred. The server might be down or misconfigured. Please check the server logs. Client-side error: "${error.message || 'Unknown fetch error'}"`;
            onPaymentError(errorMessage);
            return Promise.reject(error);
        }
    };

    const handleOnApprove = async (data: { orderID: string }) => {
        try {
            const result = await capturePaypalOrder(data.orderID);

            if (!result) {
                const errorMessage = "The server returned an empty or invalid response after payment approval.";
                onPaymentError(errorMessage);
                return;
            }

            if (result.success && result.orderData) {
                toast({
                    title: 'Payment Successful!',
                    description: "We're now creating your account...",
                });
                await onPaymentSuccess(result.orderData);
            } else {
                const errorMessage = `Payment capture failed: ${result.error}. ${result.debug ? `(Debug: ${result.debug})` : ''}`;
                onPaymentError(errorMessage);
            }
        } catch (error: any) {
             const errorMessage = `An unexpected error occurred during payment capture: ${error.message}`;
             onPaymentError(errorMessage);
        }
    };
    
    const onError = (err: any) => {
        console.error("PAYPAL_CLIENT_ERROR:", err);
        const message = err.message || 'An unknown error occurred inside the PayPal script.';
        const finalMessage = `The PayPal window closed because of an error. The error was: "${message}"`;
        onPaymentError(finalMessage);
    }

    if (isPending) {
        return (
            <div className="flex h-[44px] w-full items-center justify-center rounded-md bg-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
            </div>
        );
    }
    
    if (isRejected) {
        return (
            <div className="flex h-[44px] w-full items-center justify-center rounded-md border border-destructive bg-destructive/10 text-center text-sm text-destructive">
                Error: PayPal failed to load.
            </div>
        );
    }

    return (
        <PayPalButtons
            style={{ layout: "vertical", label: "pay", tagline: false, height: 44 }}
            createOrder={handleCreateOrder}
            onApprove={handleOnApprove}
            onError={onError}
            disabled={disabled}
            forceReRender={[planId, disabled]}
        />
    );
}

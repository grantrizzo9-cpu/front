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
             const errorMessage = 'CRITICAL: The PayPal script failed to load. This can be caused by an invalid Client ID in your .env file (check NEXT_PUBLIC_PAYPAL_CLIENT_ID), a network issue, or an ad blocker.';
             toast({
                variant: 'destructive',
                title: 'PayPal Script Load Error',
                description: errorMessage,
                duration: 15000,
            });
            onPaymentError(errorMessage);
        }
    }, [isRejected, toast, onPaymentError]);


    const handleCreateOrder = async (): Promise<string> => {
        onPaymentStart();
        try {
            // This is the most important change. We wrap the server call in a try/catch.
            const result = await createPaypalOrder(planId);

            // Defensive programming: Check if the server returned *anything* at all.
            if (!result) {
                const errorMessage = "The server returned an empty or invalid response. This suggests a server crash or a critical network issue.";
                onPaymentError(errorMessage);
                return Promise.reject(new Error(errorMessage));
            }

            // Check if the server's own error catching returned an error field.
            if (result.error || result.debug) {
                const errorMessage = `Server Error: ${result.error}. ${result.debug ? `(Debug: ${JSON.stringify(result.debug)})` : ''}`;
                onPaymentError(errorMessage);
                return Promise.reject(new Error(errorMessage));
            }

            // Check if we got an orderId, which is the only successful outcome.
            if (!result.orderId) {
                const errorMessage = "The server action succeeded but did not return a PayPal order ID. This is a bug.";
                onPaymentError(errorMessage);
                return Promise.reject(new Error(errorMessage));
            }
            
            // Happy path
            return result.orderId;

        } catch (error: any) {
            // This block will catch errors if the `await createPaypalOrder` call itself fails (e.g., total server crash, network timeout).
            const errorMessage = `A client-side exception occurred while trying to create the order. The server might be down or misconfigured. Error: "${error.message || 'Unknown fetch error'}"`;
            onPaymentError(errorMessage);
            return Promise.reject(new Error(errorMessage));
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
                    description: "Finalizing your subscription...",
                });
                await onPaymentSuccess(result.orderData);
            } else {
                const errorMessage = `Payment capture failed: ${result.error}. ${result.debug ? `(Debug: ${JSON.stringify(result.debug)})` : ''}`;
                onPaymentError(errorMessage);
            }
        } catch (error: any) {
             const errorMessage = `An unexpected error occurred during payment capture: ${error.message}`;
             onPaymentError(errorMessage);
        }
    };
    
    const onError = (err: any) => {
        // This catches errors from the PayPal script itself (e.g., window closed, invalid parameters).
        console.error("PAYPAL_CLIENT_SCRIPT_ERROR:", err);
        const message = err.message || 'An unknown error occurred inside the PayPal script.';
        const finalMessage = `The PayPal window closed due to an error: "${message}"`;
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

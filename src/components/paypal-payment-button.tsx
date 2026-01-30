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
    onPaymentError: () => void;
    disabled: boolean;
}

export function PayPalPaymentButton({ planId, onPaymentSuccess, onPaymentStart, onPaymentError, disabled }: PayPalPaymentButtonProps) {
    const { toast } = useToast();
    const [{ isPending, isRejected }] = usePayPalScriptReducer();

    useEffect(() => {
        if (isRejected) {
             toast({
                variant: 'destructive',
                title: 'PayPal Script Load Error',
                description: 'The PayPal script failed to load. This can be caused by an invalid Client ID in your .env file, a network issue, or an ad blocker. Please verify your NEXT_PUBLIC_PAYPAL_CLIENT_ID and restart the server.',
                duration: 10000,
            });
        }
    }, [isRejected, toast]);


    const handleCreateOrder = () => {
        onPaymentStart();
        
        return createPaypalOrder(planId).then(result => {
            if (result.error || !result.orderId) {
                // This path is for when the server responds successfully, but with a logical error.
                toast({
                    variant: 'destructive',
                    title: 'PayPal Server Error',
                    description: result.error || 'The server responded but could not create a PayPal order. Please try again.',
                    duration: 15000,
                });
                onPaymentError();
                // Reject the promise to trigger PayPal's onError handler.
                return Promise.reject(new Error(result.error || 'Could not create PayPal order.'));
            }
            // Success, resolve with the orderId.
            return result.orderId;
        }).catch(error => {
            // This path is for when the server action itself fails (e.g., network error, server crash).
            // This is the aggressive catch-all.
            toast({
                variant: 'destructive',
                title: 'Failed to Create Order',
                description: `A client-server communication error occurred. This is the error that was caught: "${error.message}". Please check the server logs.`,
                duration: 15000,
            });
            onPaymentError();
            // Re-throw the error to ensure PayPal's onError is also triggered.
            throw error;
        });
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
                title: 'Payment Capture Failed',
                description: result.error || 'An error occurred while processing your payment after approval. You have not been charged.',
            });
            onPaymentError();
        }
    };
    
    const onError = (err: any) => {
        // This is PayPal's own error handler. It will be triggered if handleCreateOrder rejects.
        console.error("PAYPAL_CLIENT_ERROR:", err);
        const message = err.message || 'An unknown error occurred inside the PayPal script.';
        toast({
            variant: "destructive",
            title: "PayPal Transaction Error",
            description: `The PayPal window closed because of an error. The error was: "${message}"`,
            duration: 15000,
        });
        onPaymentError();
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

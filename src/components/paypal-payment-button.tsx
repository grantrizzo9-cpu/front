
'use client';

import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
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
            const response = await fetch('/api/paypal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_order',
                    planId: planId
                }),
            });
            
            const result = await response.json();

            if (!response.ok || !result.success) {
                const errorText = `Server Error: ${result.error || `An unexpected server error occurred with status ${response.status}`}. ${result.debug ? `(Debug: ${JSON.stringify(result.debug)})` : ''}`;
                onPaymentError(errorText);
                return Promise.reject(new Error(errorText));
            }
            
            if (!result.orderId) {
                const errorMessage = "The server succeeded but did not return a PayPal order ID.";
                onPaymentError(errorMessage);
                return Promise.reject(new Error(errorMessage));
            }
            
            return result.orderId;

        } catch (error: any) {
            const errorMessage = `A client-side exception occurred while trying to create the order: "${error.message || 'Unknown fetch error'}"`;
            onPaymentError(errorMessage);
            return Promise.reject(new Error(errorMessage));
        }
    };

    const handleOnApprove = async (data: { orderID: string }) => {
        try {
            const response = await fetch('/api/paypal', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                    action: 'capture_order',
                    orderId: data.orderID
                }),
            });

            const result = await response.json();

            if (!response.ok || result.error || !result.success) {
                 const errorMessage = `Payment capture failed: ${result.error || 'Unknown server error'}. ${result.debug ? `(Debug: ${JSON.stringify(result.debug)})` : ''}`;
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
                 const errorMessage = `Payment not completed. Status: ${result.orderData?.status}`;
                 onPaymentError(errorMessage);
            }
        } catch (error: any) {
             const errorMessage = `An unexpected error occurred during payment capture: ${error.message}`;
             onPaymentError(errorMessage);
        }
    };
    
    const onError = (err: any) => {
        // The detailed error from `handleCreateOrder` is more useful, so we don't always show this one.
        const message = `The PayPal window closed unexpectedly. This is often caused by an error during order creation. Please check the error message above. Raw PayPal Script Error: "${err.message || 'Unknown'}"`;
        onPaymentError(message);
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
                Error: PayPal script failed to load. Check Client ID.
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

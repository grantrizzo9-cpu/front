
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
             window.alert(`DIAGNOSTIC STEP 1 FAILED: PayPal script load error. DETAILS: ${errorMessage}`);
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
            window.alert('DIAGNOSTIC STEP 2: createOrder function has been called. Now attempting to contact the server...');
            
            const response = await fetch('/api/paypal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_order',
                    planId: planId
                }),
            });
            
            window.alert(`DIAGNOSTIC STEP 3: Server responded with status ${response.status}. Now attempting to parse the response as JSON.`);

            const result = await response.json();
            window.alert('DIAGNOSTIC STEP 4: Server response parsed successfully.');


            if (!response.ok || !result.success) {
                const errorText = `Server Error: ${result.error || `An unexpected server error occurred with status ${response.status}`}. ${result.debug ? `(Debug: ${JSON.stringify(result.debug)})` : ''}`;
                window.alert(`DIAGNOSTIC STEP 5 FAILED: Server returned an error. DETAILS: ${errorText}`);
                onPaymentError(errorText);
                return Promise.reject(new Error(errorText));
            }
            
            if (!result.orderId) {
                const errorMessage = "The server succeeded but did not return a PayPal order ID.";
                window.alert(`DIAGNOSTIC STEP 5 FAILED: No order ID. DETAILS: ${errorMessage}`);
                onPaymentError(errorMessage);
                return Promise.reject(new Error(errorMessage));
            }
            
            window.alert(`DIAGNOSTIC STEP 5 SUCCEEDED: Got Order ID ${result.orderId}. Handing off to PayPal.`);
            return result.orderId;

        } catch (error: any) {
            window.alert(`DIAGNOSTIC STEP 3/4 FAILED: A critical error occurred while fetching or parsing. DETAILS: ${error.message}`);
            const errorMessage = `A client-side exception occurred: "${error.message || 'Unknown fetch error'}"`;
            onPaymentError(errorMessage);
            return Promise.reject(new Error(errorMessage));
        }
    };

    const handleOnApprove = async (data: { orderID: string }) => {
        try {
            window.alert(`DIAGNOSTIC STEP 6: Payment approved by user. Order ID: ${data.orderID}. Now capturing on server...`);
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
                window.alert(`DIAGNOSTIC STEP 7 FAILED: Server capture failed. DETAILS: ${errorMessage}`);
                onPaymentError(errorMessage);
                return;
            }

            if (result.success && result.orderData) {
                window.alert('DIAGNOSTIC STEP 7 SUCCEEDED: Capture successful. Calling onPaymentSuccess...');
                toast({
                    title: 'Payment Successful!',
                    description: "Finalizing your subscription...",
                });
                await onPaymentSuccess(result.orderData);
            } else {
                 const errorMessage = `Payment not completed. Status: ${result.orderData?.status}`;
                 window.alert(`DIAGNOSTIC STEP 7 FAILED: Payment not completed. DETAILS: ${errorMessage}`);
                 onPaymentError(errorMessage);
            }
        } catch (error: any) {
             const errorMessage = `An unexpected error occurred during payment capture: ${error.message}`;
             window.alert(`DIAGNOSTIC STEP 7 FAILED: Critical error during capture. DETAILS: ${errorMessage}`);
             onPaymentError(errorMessage);
        }
    };
    
    const onError = (err: any) => {
        const message = `The PayPal window closed unexpectedly or an error occurred. Raw PayPal Script Error: "${err.toString()}"`;
        window.alert(`DIAGNOSTIC: PayPal's generic onError event was triggered. DETAILS: ${message}`);
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
    
    window.alert('DIAGNOSTIC STEP 1: PayPal button is rendering. Script has loaded successfully.');

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

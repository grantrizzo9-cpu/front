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
            title: "PayPal Transaction Error",
            description: "An unexpected error occurred during the transaction. Please check your details and try again.",
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

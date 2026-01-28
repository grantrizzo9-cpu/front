'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MailCheck } from 'lucide-react';
import { subscribeToNewsletter } from '@/ai/flows/newsletter-signup';

export function NewsletterForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const result = await subscribeToNewsletter({ email });

    setIsLoading(false);

    if (result.success) {
      setIsSubmitted(true);
      toast({
        title: 'Subscription Successful!',
        description: `Thanks for joining. We've added ${email} to our list.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Subscription Failed',
        description: result.message,
      });
    }
  };

  if (isSubmitted) {
    return (
        <div className="flex flex-col items-center justify-center text-center gap-4 p-8 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
            <MailCheck className="h-12 w-12 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-xl text-green-800 dark:text-green-200">Thank You for Subscribing!</h3>
            <p className="text-muted-foreground">You're on the list. Keep an eye on your inbox for updates.</p>
        </div>
    );
  }


  return (
    <form className="flex w-full max-w-md items-center space-x-2" onSubmit={handleSubmit}>
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          'Subscribe'
        )}
      </Button>
    </form>
  );
}

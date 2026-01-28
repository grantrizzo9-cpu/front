
'use server';
/**
 * @fileOverview Handles newsletter signup functionality.
 *
 * - subscribeToNewsletter - Subscribes an email to the newsletter.
 * - SubscribeToNewsletterInput - The input type for the function.
 * - SubscribeToNewsletterOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import MailerLite from '@mailerlite/mailerlite-nodejs';

const SubscribeToNewsletterInputSchema = z.object({
  email: z.string().email().describe('The email address to subscribe.'),
});
export type SubscribeToNewsletterInput = z.infer<typeof SubscribeToNewsletterInputSchema>;

const SubscribeToNewsletterOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SubscribeToNewsletterOutput = z.infer<typeof SubscribeToNewsletterOutputSchema>;

export async function subscribeToNewsletter(input: SubscribeToNewsletterInput): Promise<SubscribeToNewsletterOutput> {
  return newsletterSignupFlow(input);
}

const newsletterSignupFlow = ai.defineFlow(
  {
    name: 'newsletterSignupFlow',
    inputSchema: SubscribeToNewsletterInputSchema,
    outputSchema: SubscribeToNewsletterOutputSchema,
  },
  async (input): Promise<SubscribeToNewsletterOutput> => {
    const apiKey = process.env.MAILERLITE_API_KEY;
    const groupId = process.env.MAILERLITE_GROUP_ID;

    if (!apiKey || apiKey === 'REPLACE_WITH_YOUR_MAILERLITE_API_KEY') {
      return {
        success: false,
        message: 'MailerLite API key is not configured on the server. Please add it to your .env file.',
      };
    }
    
    if (!groupId || groupId === 'REPLACE_WITH_YOUR_MAILERLITE_GROUP_ID') {
        return {
            success: false,
            message: 'MailerLite Group ID is not configured on the server. Please add it to your .env file.',
        }
    }

    try {
      const mailerLite = new MailerLite({ api_key: apiKey });
      await mailerLite.subscribers.createOrUpdate({
          email: input.email,
          groups: [groupId],
          status: 'active',
      });
      
      return {
        success: true,
        message: 'Successfully subscribed!',
      };

    } catch (e: any) {
      console.error('MailerLite Error:', e);
      const errorMessage = e.response?.data?.message || e.message || 'An unknown error occurred.';
      return {
        success: false,
        message: `Failed to subscribe: ${errorMessage}`,
      };
    }
  }
);

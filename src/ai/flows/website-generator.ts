'use server';

/**
 * @fileOverview An AI flow for generating a complete affiliate website.
 *
 * - generateWebsite - A function that generates content for a homepage and legal pages.
 * - GenerateWebsiteInput - The input type for the generateWebsite function.
 * - GenerateWebsiteOutput - The return type for the generateWebsite function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateWebsiteInputSchema = z.object({
  username: z.string().describe("The affiliate's username, used to construct their referral link."),
});
export type GenerateWebsiteInput = z.infer<typeof GenerateWebsiteInputSchema>;

const GenerateWebsiteOutputSchema = z.object({
  homepage: z.object({
    title: z.string().describe('A creative and SEO-friendly title for the website.'),
    headline: z.string().describe('The main, catchy headline for the hero section of the homepage.'),
    subheadline: z.string().describe('A short, persuasive subheadline that supports the main headline.'),
    ctaButtonText: z.string().describe('Compelling text for the primary call-to-action button.'),
    features: z.array(z.object({
      title: z.string().describe('The title of a key feature.'),
      description: z.string().describe('A brief description of the feature.'),
    })).length(3).describe('A list of exactly 3 key features of the Affiliate AI Host platform.'),
  }),
  terms: z.string().describe('The full text for a generic Terms of Service page suitable for an affiliate site.'),
  privacy: z.string().describe('The full text for a generic Privacy Policy page suitable for an affiliate site.'),
  disclaimer: z.string().describe('The full text for a generic Earnings Disclaimer page suitable for an affiliate site.'),
  error: z.string().optional().describe("An error message if content generation failed."),
});
export type GenerateWebsiteOutput = z.infer<typeof GenerateWebsiteOutputSchema>;

export async function generateWebsite(input: GenerateWebsiteInput): Promise<GenerateWebsiteOutput> {
  return websiteGeneratorFlow(input);
}

const prompt = ai.definePrompt({
    name: 'websiteGeneratorPrompt',
    input: { schema: GenerateWebsiteInputSchema },
    output: { schema: GenerateWebsiteOutputSchema },
    prompt: `You are an expert copywriter and website strategist specializing in high-converting affiliate marketing websites.

Your task is to generate the complete text content for a simple, single-page affiliate website. The website's sole purpose is to promote "Affiliate AI Host", a platform that offers AI-powered web hosting and a lucrative affiliate program with daily payouts.

The affiliate's username is "{{username}}". All call-to-action links on the site will point to their unique referral link: https://hostproai.com/?ref={{username}}.

The tone should be enthusiastic, trustworthy, and benefit-oriented. Generate content that is creative and persuasive. Critically, you must vary the wording and angle for each generation to ensure the websites are unique, but always maintain the core goal of getting visitors to click the affiliate link.

Generate content for the following pages, formatted as a single JSON object:

1.  **Homepage**: This is the main landing page.
    *   **title**: A creative, SEO-friendly title for the website (e.g., "Your Daily Income Engine" or "The AI-Powered Affiliate Shortcut").
    *   **headline**: A powerful, attention-grabbing headline for the hero section.
    *   **subheadline**: A concise subheadline that explains the main benefit.
    *   **ctaButtonText**: Action-oriented text for the main call-to-action button (e.g., "Start Earning Daily" or "Activate My AI Toolkit").
    *   **features**: A list of exactly 3 key features of Affiliate AI Host. For each, provide a catchy title and a brief, benefit-focused description. Examples: "Daily PayPal Payouts", "Generous 70-75% Commissions", "Built-in AI Content Tools".

2.  **Legal Pages**: Generate standard, generic boilerplate text for the following legal pages. The content should be suitable for a small, independent affiliate marketing website.
    *   **terms**: A simple Terms of Service.
    *   **privacy**: A simple Privacy Policy.
    *   **disclaimer**: A simple Earnings Disclaimer, making it clear that earnings are not guaranteed.

Do not include any markdown formatting like \`\`\`json in your output. The output must be a pure JSON object that strictly adheres to the provided schema.`,
});

const websiteGeneratorFlow = ai.defineFlow(
    {
        name: 'websiteGeneratorFlow',
        inputSchema: GenerateWebsiteInputSchema,
        outputSchema: GenerateWebsiteOutputSchema,
    },
    async (input): Promise<GenerateWebsiteOutput> => {
        try {
            const { output } = await prompt(input);
            if (!output) {
                return {
                    homepage: { title: '', headline: '', subheadline: '', ctaButtonText: '', features: [] },
                    terms: '',
                    privacy: '',
                    disclaimer: '',
                    error: 'The AI model did not return any content.'
                };
            }
            return output;
        } catch (e: any) {
            console.error('Website Generation Error:', e);
            const rawErrorMessage = e.message || 'An unknown error occurred.';
            
             if (rawErrorMessage.includes("API key not valid")) {
                 return {
                    homepage: { title: '', headline: '', subheadline: '', ctaButtonText: '', features: [] },
                    terms: '',
                    privacy: '',
                    disclaimer: '',
                    error: `Authentication failed. The Gemini API Key you provided in the .env file appears to be invalid. Please double-check that you have copied the entire key correctly. If you just updated the key, you may need to restart the development server. Raw error: "${rawErrorMessage}"` };
            }

            return {
                homepage: { title: '', headline: '', subheadline: '', ctaButtonText: '', features: [] },
                terms: '',
                privacy: '',
                disclaimer: '',
                error: `The connection to the AI service failed. This could be a network issue or a problem with your Google Cloud project setup. Please check your environment and configuration. Raw error: "${rawErrorMessage}"` };
        }
    }
);

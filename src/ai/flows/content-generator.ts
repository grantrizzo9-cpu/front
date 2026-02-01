
'use server';

/**
 * @fileOverview A simple AI content generator flow.
 *
 * - generateContent - A function that generates text content based on a topic and type.
 * - GenerateContentInput - The input type for the generateContent function.
 * - GenerateContentOutput - The return type for the generateContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateContentInputSchema = z.object({
  topic: z.string().describe('The topic or subject for the content.'),
  contentType: z.string().describe('The type of content to generate (e.g., blog post intro, social media post).'),
  wordCount: z.number().optional().describe('The desired word count for the generated content.'),
});
export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

const GenerateContentOutputSchema = z.object({
  content: z.string().optional().describe('The generated text content.'),
  error: z.string().optional().describe("An error message if content generation failed."),
});
export type GenerateContentOutput = z.infer<typeof GenerateContentOutputSchema>;


export async function generateContent(input: GenerateContentInput): Promise<GenerateContentOutput> {
    return contentGeneratorFlow(input);
}


const prompt = ai.definePrompt({
    name: 'contentGeneratorPrompt',
    input: { schema: GenerateContentInputSchema },
    // The prompt's output schema should be just the content
    output: { schema: z.object({ content: z.string() }) },
    prompt: `You are an expert content creator and copywriter. Your task is to generate a compelling "{{contentType}}" about the following topic: "{{topic}}".
    {{#if wordCount}}
    The content should be approximately {{wordCount}} words long.
    {{/if}}
    The output should be just the generated content, ready to be copied and pasted.`,
});


const contentGeneratorFlow = ai.defineFlow(
    {
        name: 'contentGeneratorFlow',
        inputSchema: GenerateContentInputSchema,
        outputSchema: GenerateContentOutputSchema,
    },
    async (input): Promise<GenerateContentOutput> => {
        try {
            const { output } = await prompt(input);
            if (!output) {
                return { error: 'The AI model did not return any content.' };
            }
            return { content: output.content };
        } catch (e: any) {
            console.error('Content Generation Error:', e);
            const rawErrorMessage = e.message || 'An unknown error occurred.';

            let userFriendlyError = `The connection to the AI service failed. This could be a network issue or a problem with your Google Cloud project setup. Please check your environment and configuration. Raw error: "${rawErrorMessage}"`;

            if (rawErrorMessage.includes("API key not valid")) {
                 userFriendlyError = `Authentication failed. The Gemini API Key you provided in the .env file appears to be invalid. Please double-check that you have copied the entire key correctly. If you just updated the key, you may need to restart the development server. Raw error: "${rawErrorMessage}"`;
            } else if (rawErrorMessage.includes("API is only accessible to billed users at this time")) {
                 userFriendlyError = 'Content Generation Blocked by Google Policy: This AI model requires a project with a billing history. This is not a bug in the app. To resolve this, you may need to wait for a billing cycle or contact Google Cloud support regarding your project\'s billing status.';
            } else if (rawErrorMessage.includes("Quota exceeded") || rawErrorMessage.includes("Too Many Requests")) {
                userFriendlyError = `API Rate Limit Reached: The AI service's free tier has a limited number of requests per minute and per day. You have exceeded this limit. This is not a bug. Please wait, or for unlimited access, add a billing account to your Google Cloud project. Raw error: "${rawErrorMessage}"`;
            }

            return { error: userFriendlyError };
        }
    }
);

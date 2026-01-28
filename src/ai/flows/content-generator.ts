
'use server';

/**
 * @fileOverview A simple AI content generator flow.
 *
 * - generateContent - A function that generates text content based on a topic and type.
 * - GenerateContentInput - The input type for the generateContent function.
 * - GenerateContentOutput - The return type for the generateContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
        if (!process.env.GEMINI_API_KEY) {
            return { error: 'The GEMINI_API_KEY environment variable is not set. Please add it to your environment to use AI features. You can get a key from Google AI Studio.' };
        }
        try {
            const { output } = await prompt(input);
            if (!output) {
                return { error: 'The AI model did not return any content.' };
            }
            return { content: output.content };
        } catch (e: any) {
            console.error('Content Generation Error:', e);
            // New simplified error handling. Show the raw error to the user for better debugging.
            const rawErrorMessage = e.message || 'An unknown error occurred.';
            return { error: `The connection to the AI service failed. This could be a network issue, an invalid API key, or a problem with your Google Cloud project setup. Please check your environment and configuration. Raw error: "${rawErrorMessage}"` };
        }
    }
);

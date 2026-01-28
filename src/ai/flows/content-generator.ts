
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
            const errorMessage = e.message || 'An unknown error occurred.';
            
            // Check for most specific errors first.
            if (errorMessage.includes('API key not valid')) {
                return { error: 'The AI service is not configured correctly. Please ensure your GEMINI_API_KEY is valid.' };
            }
            if (errorMessage.includes('Vertex AI API has not been used') || errorMessage.includes('API is not enabled')) {
                 return { error: 'The Vertex AI API is not enabled for your project. Please enable it in your Google Cloud console to use AI features.' };
            }
            if (errorMessage.includes('billing account')) {
                 return { error: 'A billing account is required to use this AI model. Please ensure billing is enabled for your Google Cloud project.' };
            }
            if (errorMessage.includes('content was blocked')) {
                return { error: 'The content could not be generated because the prompt was blocked by the safety filter. Please try a different prompt.' };
            }
            if (errorMessage.includes('404 Not Found') || errorMessage.includes('is not found for API version')) {
                return { error: 'The selected AI model is not available for your account. This may be due to account status or regional restrictions.' };
            }
            if (errorMessage.includes('Request failed with status code 400')) {
                return { error: 'The request to the AI service was malformed. This may be due to an invalid API key or a problem with the prompt.' };
            }
            // This is a generic network error, check for it last.
            if (errorMessage.includes('Failed to fetch')) {
                 return { error: 'Could not connect to the AI service. This may be due to a network issue or the Vertex AI API not being enabled on your Google Cloud project.' };
            }

            return { error: `An unexpected error occurred. Details: ${errorMessage.substring(0, 150)}...` };
        }
    }
);


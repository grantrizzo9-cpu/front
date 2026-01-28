
'use server';

/**
 * @fileOverview An AI image generator flow.
 *
 * - generateImage - A function that generates an image based on a text prompt.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().optional().describe('The data URI of the generated image.'),
  error: z.string().optional().describe("An error message if image generation failed."),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
    return imageGeneratorFlow(input);
}

const imageGeneratorFlow = ai.defineFlow(
    {
        name: 'imageGeneratorFlow',
        inputSchema: GenerateImageInputSchema,
        outputSchema: GenerateImageOutputSchema,
    },
    async (input): Promise<GenerateImageOutput> => {
        if (!process.env.GEMINI_API_KEY) {
            return { error: 'The GEMINI_API_KEY environment variable is not set. Please add it to your environment to use the AI Image Generator. You can get a key from Google AI Studio.' };
        }
        try {
            const { media } = await ai.generate({
                model: 'googleai/imagen-4.0-fast-generate-001',
                prompt: input.prompt,
            });

            if (!media || !media.url) {
                return { error: 'The AI model did not return an image.' };
            }

            return { imageUrl: media.url };
        } catch (e: any) {
            console.error('Image Generation Error:', e);
            // New simplified error handling. Show the raw error to the user for better debugging.
            const rawErrorMessage = e.message || 'An unknown error occurred.';
            return { error: `The connection to the AI service failed. This could be a network issue, an invalid API key, or a problem with your Google Cloud project setup. Please check your environment and configuration. Raw error: "${rawErrorMessage}"` };
        }
    }
);


'use server';

/**
 * @fileOverview An AI image generator flow.
 *
 * - generateImage - A function that generates an image based on a text prompt.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
            const rawErrorMessage = e.message || 'An unknown error occurred.';

            let userFriendlyError = `The connection to the AI service failed. This could be a network issue or a problem with your Google Cloud project setup. Please check your environment and configuration. Raw error: "${rawErrorMessage}"`;

            if (rawErrorMessage.includes("API key not valid")) {
                 userFriendlyError = `Authentication failed. The Gemini API Key you provided in the .env file appears to be invalid. Please double-check that you have copied the entire key correctly. If you just updated the key, you may need to restart the development server. Raw error: "${rawErrorMessage}"`;
            } else if (rawErrorMessage.includes("Imagen API is only accessible to billed users at this time")) {
                userFriendlyError = 'Image Generation Blocked by Google Policy: The Imagen API requires a project with a billing history. This is not a bug in the app. To resolve this, you may need to wait for a billing cycle or contact Google Cloud support regarding your project\'s billing status.';
            } else if (rawErrorMessage.includes("Quota exceeded") || rawErrorMessage.includes("Too Many Requests")) {
                userFriendlyError = `API Rate Limit Reached: The AI service's free tier has a limited number of requests per minute and per day. You have exceeded this limit. This is not a bug. Please wait, or for unlimited access, add a billing account to your Google Cloud project. Raw error: "${rawErrorMessage}"`;
            }

            return { error: userFriendlyError };
        }
    }
);

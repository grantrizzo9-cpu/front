
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
            const errorMessage = e.message || 'An unknown error occurred.';

            if (errorMessage.includes('Failed to fetch')) {
                 return { error: 'Could not connect to the AI service. This may be due to a network issue or the Vertex AI API not being enabled on your Google Cloud project.' };
            }
            if (errorMessage.includes('API key not valid')) {
                return { error: 'The AI service is not configured correctly. Please ensure your GEMINI_API_KEY is valid.' };
            }
            if (errorMessage.includes('Vertex AI API has not been used') || errorMessage.includes('API is not enabled')) {
                 return { error: 'The Vertex AI API is not enabled for your project. Please enable it in your Google Cloud console to use the image generator.' };
            }
            if (errorMessage.includes('billing account')) {
                 return { error: 'A billing account is required to use this AI model. Please ensure billing is enabled for your Google Cloud project.' };
            }
            if (errorMessage.includes('Request failed with status code 400')) {
                return { error: 'The request to the AI service was malformed. This may be due to an invalid API key or a problem with the prompt.' };
            }
            if (errorMessage.includes('404 Not Found') || errorMessage.includes('is not found for API version')) {
                return { error: 'The selected AI model is not available for your account. This may be due to account status or regional restrictions.' };
            }
             if (errorMessage.includes('content was blocked')) {
                return { error: 'The image could not be generated because the prompt was blocked by the safety filter. Please try a different prompt.' };
            }

            return { error: `An unexpected error occurred. Details: ${errorMessage.substring(0, 150)}...` };
        }
    }
);

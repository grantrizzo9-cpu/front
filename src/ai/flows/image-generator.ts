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
            const errorMessage = e.message || 'An unknown error occurred.';
             if (errorMessage.includes('Request failed with status code 400') || errorMessage.includes('API key not valid')) {
                return { error: 'The AI service is not configured correctly. Please ensure your GEMINI_API_KEY is set in your deployment environment.' };
            }
            if (errorMessage.includes('404 Not Found') || errorMessage.includes('is not found for API version')) {
                return { error: 'The selected AI model is not available for your account. This may be due to account status or regional restrictions.' };
            }
             if (errorMessage.includes('blocked') || errorMessage.includes('SAFETY')) {
                return { error: 'The prompt was blocked by the safety filter. Please try a different prompt.' };
            }
            return { error: errorMessage };
        }
    }
);

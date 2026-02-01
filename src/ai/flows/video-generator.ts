
'use server';

/**
 * @fileOverview An AI video generator flow.
 *
 * - generateVideo - A function that generates a video based on a text prompt.
 * - GenerateVideoInput - The input type for the generateVideo function.
 * - GenerateVideoOutput - The return type for the generateVideo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { MediaPart } from 'genkit';

const GenerateVideoInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate a video from.'),
});
export type GenerateVideoInput = z.infer<typeof GenerateVideoInputSchema>;

const GenerateVideoOutputSchema = z.object({
  videoUrl: z.string().optional().describe('The data URI of the generated video.'),
  error: z.string().optional().describe("An error message if video generation failed."),
});
export type GenerateVideoOutput = z.infer<typeof GenerateVideoOutputSchema>;

export async function generateVideo(input: GenerateVideoInput): Promise<GenerateVideoOutput> {
    return videoGeneratorFlow(input);
}


/**
 * Downloads the video content from a temporary URL and returns it as a buffer.
 * The URL requires the API key to be appended for access.
 * @param video The MediaPart object containing the video URL.
 * @returns A Promise that resolves to a Buffer with the video data.
 */
async function downloadVideoToBuffer(video: MediaPart): Promise<Buffer> {
    if (!video.media?.url) {
        throw new Error('Video media part does not contain a URL.');
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Your Gemini API Key is not available to download the video. Please check your .env file.');
    }
    
    const fetch = (await import('node-fetch')).default;

    const videoDownloadUrl = `${video.media.url}&key=${apiKey}`;
    
    const videoDownloadResponse = await fetch(videoDownloadUrl);

    if (!videoDownloadResponse.ok || !videoDownloadResponse.body) {
        throw new Error(`Failed to download video file: ${videoDownloadResponse.statusText}`);
    }

    const arrayBuffer = await videoDownloadResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

const videoGeneratorFlow = ai.defineFlow(
    {
        name: 'videoGeneratorFlow',
        inputSchema: GenerateVideoInputSchema,
        outputSchema: GenerateVideoOutputSchema,
    },
    async (input): Promise<GenerateVideoOutput> => {
        try {
            let { operation } = await ai.generate({
                model: 'googleai/veo-2.0-generate-001',
                prompt: input.prompt,
                config: {
                    durationSeconds: 5,
                    aspectRatio: '16:9',
                },
            });

            if (!operation) {
                return { error: 'The model did not return a video generation operation.' };
            }

            // Poll the operation status until it is complete.
            while (!operation.done) {
                await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
                operation = await ai.checkOperation(operation);
            }

            if (operation.error) {
                console.error('Video Generation Operation Error:', operation.error);
                return { error: `Video generation failed: ${operation.error.message}` };
            }

            const video = operation.output?.message?.content.find((p) => !!p.media);

            if (!video) {
                return { error: 'Failed to find the generated video in the operation output.' };
            }

            const videoBuffer = await downloadVideoToBuffer(video);
            const videoDataUri = `data:video/mp4;base64,${videoBuffer.toString('base64')}`;

            return { videoUrl: videoDataUri };

        } catch (e: any) {
            console.error('Video Generation Flow Error:', e);
            const rawErrorMessage = e.message || 'An unknown error occurred.';

            let userFriendlyError = `The connection to the AI service failed. This could be a network issue or a problem with your Google Cloud project setup. Please check your environment and configuration. Raw error: "${rawErrorMessage}"`;

            if (rawErrorMessage.includes("API key not valid")) {
                 userFriendlyError = `Authentication failed. The Gemini API Key you provided in the .env file appears to be invalid. Please double-check that you have copied the entire key correctly. If you just updated the key, you may need to restart the development server. Raw error: "${rawErrorMessage}"`;
            } else if (rawErrorMessage.includes("Quota exceeded") || rawErrorMessage.includes("Too Many Requests") || rawErrorMessage.includes("billing account not found") || rawErrorMessage.includes("API is not enabled")) {
                userFriendlyError = `Action Required: To use your account's credits, you must enable the 'Cloud AI Companion API' (for Veo) for this project. Even if billing is active, this specific API needs to be turned on. It's a quick, one-time step. Please use the button that now appears on the screen to enable the API, then try again in a moment. Raw error: "${rawErrorMessage}"`;
            }

            return { error: userFriendlyError };
        }
    }
);

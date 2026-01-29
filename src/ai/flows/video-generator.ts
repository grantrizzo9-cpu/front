
'use server';

/**
 * @fileOverview An AI video generator flow.
 *
 * - generateVideo - A function that generates a video based on a text prompt.
 * - GenerateVideoInput - The input type for the generateVideo function.
 * - GenerateVideoOutput - The return type for the generateVideo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
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

            if (rawErrorMessage.includes("API key not valid")) {
                 return { error: `Authentication failed. Please check that your Gemini API Key in the .env file is correct. Raw error: "${rawErrorMessage}"` };
            }

            if (rawErrorMessage.includes("API is only accessible to billed users at this time")) {
                return { error: 'Video Generation Blocked by Google Policy: This AI model requires a project with a billing history. This is not a bug in the app. To resolve this, you may need to wait for a billing cycle or contact Google Cloud support regarding your project\'s billing status.' };
            }

            return { error: `The connection to the AI service failed. This could be a network issue or a problem with your Google Cloud project setup. Please check your environment and configuration. Raw error: "${rawErrorMessage}"` };
        }
    }
);

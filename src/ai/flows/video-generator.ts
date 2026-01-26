'use server';
    
/**
 * @fileOverview An AI flow for generating video from a text prompt.
 *
 * - generateVideo - A function that generates a video based on a prompt.
 * - GenerateVideoInput - The input type for the generateVideo function.
 * - GenerateVideoOutput - The return type for the generateVideo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MediaPart } from 'genkit';
import { Readable } from 'stream';

const GenerateVideoInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the video to generate.'),
});
export type GenerateVideoInput = z.infer<typeof GenerateVideoInputSchema>;

const GenerateVideoOutputSchema = z.object({
  videoDataUri: z.string().optional().describe("The generated video as a data URI in video/mp4 format."),
  error: z.string().optional().describe("An error message if video generation failed."),
});
export type GenerateVideoOutput = z.infer<typeof GenerateVideoOutputSchema>;

export async function generateVideo(input: GenerateVideoInput): Promise<GenerateVideoOutput> {
  return videoGeneratorFlow(input);
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

async function downloadVideo(video: MediaPart): Promise<string> {
    const fetch = (await import('node-fetch')).default;
    // Add API key before fetching the video.
    const videoDownloadResponse = await fetch(
        `${video.media!.url}&key=${process.env.GEMINI_API_KEY}`
    );
    if (
        !videoDownloadResponse ||
        videoDownloadResponse.status !== 200 ||
        !videoDownloadResponse.body
    ) {
        throw new Error('Failed to fetch video');
    }

    const buffer = await streamToBuffer(Readable.from(videoDownloadResponse.body));
    return `data:video/mp4;base64,${buffer.toString('base64')}`;
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
        model: 'googleai/veo-3.0-generate-preview',
        prompt: input.prompt,
        config: {
          aspectRatio: '16:9',
        },
      });

      if (!operation) {
        return { error: 'Expected the model to return an operation, but it did not.' };
      }

      // Wait until the operation completes.
      while (!operation.done) {
        operation = await ai.checkOperation(operation);
        // Sleep for 5 seconds before checking again.
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      if (operation.error) {
        const errorMessage = operation.error.message || '';
        if (errorMessage.includes('404 Not Found') || errorMessage.includes('is not found for API version')) {
            return { error: 'The selected AI video model is not available for your account. This may be due to account status or regional restrictions. Please try again after your billing is fully activated.' };
        }
        return { error: `Video generation failed: ${errorMessage}` };
      }

      const video = operation.output?.message?.content.find((p) => !!p.media);
      if (!video) {
        return { error: 'Failed to find the generated video in the AI response.' };
      }

      const videoDataUri = await downloadVideo(video);
      
      return { videoDataUri };
    } catch (e: any) {
        const errorMessage = e.message || 'An unknown error occurred.';
         if (errorMessage.includes('404 Not Found') || errorMessage.includes('is not found for API version')) {
            return { error: 'The selected AI video model is not available for your account. This may be due to account status or regional restrictions. Please try again after your billing is fully activated.' };
        }
        return { error: 'An unexpected error occurred while trying to generate the video.' };
    }
  }
);

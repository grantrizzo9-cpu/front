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

export const GenerateContentInputSchema = z.object({
  topic: z.string().describe('The topic or subject for the content.'),
  contentType: z.string().describe('The type of content to generate (e.g., blog post intro, social media post).'),
});
export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

export const GenerateContentOutputSchema = z.object({
  content: z.string().describe('The generated text content.'),
});
export type GenerateContentOutput = z.infer<typeof GenerateContentOutputSchema>;


export async function generateContent(input: GenerateContentInput): Promise<GenerateContentOutput> {
    return contentGeneratorFlow(input);
}


const prompt = ai.definePrompt({
    name: 'contentGeneratorPrompt',
    input: { schema: GenerateContentInputSchema },
    output: { schema: GenerateContentOutputSchema },
    prompt: `You are an expert content creator and copywriter. Your task is to generate a compelling "{{contentType}}" about the following topic: "{{topic}}".

    The output should be just the generated content, ready to be copied and pasted.`,
});


const contentGeneratorFlow = ai.defineFlow(
    {
        name: 'contentGeneratorFlow',
        inputSchema: GenerateContentInputSchema,
        outputSchema: GenerateContentOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);

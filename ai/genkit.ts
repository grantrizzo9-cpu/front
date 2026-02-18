import 'dotenv/config';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey || geminiApiKey.includes('REPLACE_WITH')) {
  console.warn("WARNING: The GEMINI_API_KEY is not set correctly in your .env file. AI features will fail. Please get your key from Google AI Studio and add it to the .env file.");
}

export const ai = genkit({
  plugins: [googleAI({apiKey: geminiApiKey})],
  model: 'googleai/gemini-2.5-flash',
});

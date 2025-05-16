
'use server';
/**
 * @fileOverview An AI flow to recognize a tablet or capsule from an image.
 *
 * - recognizeTablet - A function that handles the tablet recognition process.
 * - RecognizeTabletInput - The input type for the recognizeTablet function.
 * - RecognizeTabletOutput - The return type for the recognizeTablet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecognizeTabletInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a tablet or capsule, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RecognizeTabletInput = z.infer<typeof RecognizeTabletInputSchema>;

const RecognizeTabletOutputSchema = z.object({
  medicineName: z.string().describe('The most likely brand or generic name of the recognized medicine. If unsure, state that explicitly, e.g., "Could not identify medicine".'),
});
export type RecognizeTabletOutput = z.infer<typeof RecognizeTabletOutputSchema>;

export async function recognizeTablet(input: RecognizeTabletInput): Promise<RecognizeTabletOutput> {
  return recognizeTabletFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recognizeTabletPrompt',
  input: {schema: RecognizeTabletInputSchema},
  output: {schema: RecognizeTabletOutputSchema},
  prompt: `You are a medicine identification assistant.
Analyze the provided image of a pill, tablet, or capsule.
Your goal is to identify the medicine based on its visual characteristics (shape, color, markings, imprint).
Respond with the most likely brand or generic name of the recognized medicine.
If the image is unclear, does not appear to be a medicine, or you cannot confidently identify the medicine, respond with "Could not identify medicine".

Image of the tablet/capsule:
{{media url=photoDataUri}}`,
});

const recognizeTabletFlow = ai.defineFlow(
  {
    name: 'recognizeTabletFlow',
    inputSchema: RecognizeTabletInputSchema,
    outputSchema: RecognizeTabletOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      return { medicineName: "Could not get a response from the AI model." };
    }
    return output;
  }
);


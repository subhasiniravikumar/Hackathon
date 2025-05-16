// 'use server'
'use server';

/**
 * @fileOverview A chatbot flow for answering user queries about medicines.
 *
 * - medicineQueryChatbot - A function that handles the medicine query process.
 * - MedicineQueryChatbotInput - The input type for the medicineQueryChatbot function.
 * - MedicineQueryChatbotOutput - The return type for the medicineQueryChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicineQueryChatbotInputSchema = z.object({
  query: z.string().describe('The user query about a medicine.'),
});
export type MedicineQueryChatbotInput = z.infer<typeof MedicineQueryChatbotInputSchema>;

const MedicineQueryChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user query.'),
});
export type MedicineQueryChatbotOutput = z.infer<typeof MedicineQueryChatbotOutputSchema>;

export async function medicineQueryChatbot(input: MedicineQueryChatbotInput): Promise<MedicineQueryChatbotOutput> {
  return medicineQueryChatbotFlow(input);
}

const medicineQueryChatbotPrompt = ai.definePrompt({
  name: 'medicineQueryChatbotPrompt',
  input: {schema: MedicineQueryChatbotInputSchema},
  output: {schema: MedicineQueryChatbotOutputSchema},
  prompt: `You are a helpful chatbot assistant providing information about medicines.
  Answer the following query about a medicine:
  {{query}}`,
});

const medicineQueryChatbotFlow = ai.defineFlow(
  {
    name: 'medicineQueryChatbotFlow',
    inputSchema: MedicineQueryChatbotInputSchema,
    outputSchema: MedicineQueryChatbotOutputSchema,
  },
  async input => {
    const {output} = await medicineQueryChatbotPrompt(input);
    return output!;
  }
);

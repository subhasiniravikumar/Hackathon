
'use server';
/**
 * @fileOverview An AI flow to get details (uses, pros, cons) for a given medicine name.
 *
 * - getMedicineDetails - A function that handles fetching medicine details.
 * - MedicineDetailsInput - The input type for the getMedicineDetails function.
 * - MedicineDetailsOutput - The return type for the getMedicineDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicineDetailsInputSchema = z.object({
  medicineName: z.string().describe('The name of the medicine to get details for.'),
});
export type MedicineDetailsInput = z.infer<typeof MedicineDetailsInputSchema>;

const MedicineDetailsOutputSchema = z.object({
  generalDescription: z.string().describe('A brief general overview of what the medicine is.'),
  uses: z.string().describe('Common uses or indications for the medicine.'),
  pros: z.string().describe('Potential benefits or advantages of using the medicine.'),
  cons: z.string().describe('Potential side effects, drawbacks, or contraindications.'),
});
export type MedicineDetailsOutput = z.infer<typeof MedicineDetailsOutputSchema>;

export async function getMedicineDetails(input: MedicineDetailsInput): Promise<MedicineDetailsOutput> {
  return medicineDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medicineDetailsPrompt',
  input: {schema: MedicineDetailsInputSchema},
  output: {schema: MedicineDetailsOutputSchema},
  prompt: `You are a helpful medical information assistant.
The user has provided a medicine name: {{{medicineName}}}.

Please provide a concise, easy-to-understand description of this medicine.
Include its common uses, potential pros (benefits), and potential cons (side effects or drawbacks).
If the name seems ambiguous, too generic to provide specific information, or not like a medicine, please indicate that.
Organize your response clearly into these sections: General Description, Uses, Pros, and Cons.

Example for a valid medicine:
Medicine Name: Paracetamol
General Description: Paracetamol is a common pain reliever and fever reducer.
Uses: Used to treat mild to moderate pain (from headaches, menstrual periods, toothaches, backaches, osteoarthritis, or cold/flu aches and pains) and to reduce fever.
Pros: Generally safe when used as directed, available over-the-counter, effective for pain and fever.
Cons: Overdose can cause severe liver damage. Not effective for inflammation.

For the medicine "{{{medicineName}}}":
General Description:
Uses:
Pros:
Cons:
`,
});

const medicineDetailsFlow = ai.defineFlow(
  {
    name: 'medicineDetailsFlow',
    inputSchema: MedicineDetailsInputSchema,
    outputSchema: MedicineDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
     if (!output) {
      return {
        generalDescription: "Could not get a response from the AI model for details.",
        uses: "N/A",
        pros: "N/A",
        cons: "N/A",
      };
    }
    return output;
  }
);

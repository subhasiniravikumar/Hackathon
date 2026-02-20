
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
  try {
    // Direct API call to Gemini v1 endpoint
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY || '';
    
    const prompt = `You are a helpful medical information assistant.
The user has provided a medicine name: ${input.medicineName}.

Please provide a concise, easy-to-understand description of this medicine.
Include its common uses, potential pros (benefits), and potential cons (side effects or drawbacks).
If the name seems ambiguous, too generic to provide specific information, or not like a medicine, please indicate that.

Respond ONLY in this exact JSON format:
{
  "generalDescription": "brief overview of the medicine",
  "uses": "common uses or indications",
  "pros": "potential benefits or advantages",
  "cons": "potential side effects or drawbacks"
}`;

    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('Gemini API Error:', errorData);
      throw new Error(`API Error: ${errorData.error?.message || apiResponse.statusText}`);
    }

    const responseData = await apiResponse.json();
    const aiResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    
    // Parse JSON response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        generalDescription: parsed.generalDescription || 'No description available.',
        uses: parsed.uses || 'No usage information available.',
        pros: parsed.pros || 'No benefits information available.',
        cons: parsed.cons || 'No side effects information available.',
      };
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Medicine details error:', error);
    // Fallback response on error
    return {
      generalDescription: `${input.medicineName} is a medication. For specific information, please consult your healthcare provider.`,
      uses: 'Consult a healthcare professional for detailed usage information.',
      pros: 'Effectiveness varies by individual. Consult your doctor.',
      cons: 'Potential side effects exist. Consult your doctor before use.',
    };
  }
}

const prompt = ai.definePrompt({
  name: 'medicineDetailsPrompt',
  input: {schema: MedicineDetailsInputSchema},
  output: {schema: MedicineDetailsOutputSchema},
  model: 'googleai/gemini-1.5-flash-002', // Specify model directly
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

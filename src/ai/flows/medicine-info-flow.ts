import { ai } from '../genkit';
import { z } from 'genkit';

// Define schema for medicine information request
const MedicineInfoRequestSchema = z.object({
  medicineName: z.string().describe('The name of the medicine to get information about'),
  includeDetails: z.boolean().optional().describe('Whether to include detailed information'),
});

// Define schema for medicine information response
const MedicineInfoResponseSchema = z.object({
  brandName: z.string().describe('Brand name of the medicine'),
  genericName: z.string().describe('Generic/chemical name of the medicine'),
  dosage: z.string().describe('Standard dosage information'),
  category: z.string().describe('Medicine category (e.g., Painkiller, Antibiotic)'),
  uses: z.string().describe('What the medicine is used for'),
  sideEffects: z.string().describe('Common side effects'),
  price: z.string().describe('Approximate price range in INR'),
  warnings: z.string().describe('Important warnings and precautions'),
  isVerified: z.boolean().describe('Whether the information is verified and accurate'),
  confidence: z.number().describe('Confidence level of the information (0-100)'),
});

export const getMedicineDetailsFlow = ai.defineFlow(
  {
    name: 'getMedicineDetails',
    inputSchema: MedicineInfoRequestSchema,
    outputSchema: MedicineInfoResponseSchema,
  },
  async (input) => {
    const prompt = `You are a medical information expert. Provide accurate, verified information about the medicine: "${input.medicineName}".

IMPORTANT: Only provide information if you are confident the medicine exists and your information is accurate. If you are unsure or the medicine doesn't exist, set isVerified to false.

Please provide the following details in a structured format:

1. Brand Name: The commercial/brand name
2. Generic Name: The active ingredient/generic name
3. Dosage: Standard dosage information
4. Category: Type of medicine (Painkiller, Antibiotic, Antihistamine, etc.)
5. Uses: What conditions/symptoms it treats
6. Side Effects: Common side effects
7. Price: Approximate price range in Indian Rupees (INR)
8. Warnings: Important precautions and contraindications
9. Confidence: Your confidence level (0-100) in this information

Return the information in JSON format matching the schema.`;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: prompt,
      output: {
        schema: MedicineInfoResponseSchema,
      },
    });

    return llmResponse.output!;
  }
);

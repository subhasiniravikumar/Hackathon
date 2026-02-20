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
  medicineData: z.object({
    brandName: z.string().optional(),
    genericName: z.string().optional(),
    dosage: z.string().optional(),
    category: z.string().optional(),
    uses: z.string().optional(),
    sideEffects: z.string().optional(),
    price: z.string().optional(),
    isValidMedicine: z.boolean().describe('Whether this is actually medicine information'),
  }).optional().describe('Structured medicine data if the query is about a specific medicine'),
});
export type MedicineQueryChatbotOutput = z.infer<typeof MedicineQueryChatbotOutputSchema>;

export async function medicineQueryChatbot(input: MedicineQueryChatbotInput): Promise<MedicineQueryChatbotOutput> {
  try {
    // Direct API call to Gemini v1 endpoint
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY || '';
    
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
                  text: `You are a medical information assistant providing accurate, concise information about medicines.

TASK 1: Determine if the user is asking about a SPECIFIC MEDICINE (not general health questions).

TASK 2: Provide a CONCISE response (2-4 sentences) with:
- Bullet points for lists (dosage, side effects, etc.)
- Accurate, factual information
- End with: "Consult a healthcare professional for personalized advice."

TASK 3: If asking about a specific medicine, extract structured data in this EXACT JSON format at the END of your response:
---MEDICINE_DATA---
{
  "brandName": "Brand name",
  "genericName": "Generic/chemical name",
  "dosage": "Standard dosage",
  "category": "Category (Painkiller/Antibiotic/etc)",
  "uses": "What it treats",
  "sideEffects": "Common side effects",
  "price": "Price range in INR",
  "isValidMedicine": true
}
---END_DATA---

If NOT asking about a specific medicine, set isValidMedicine to false.

User Query: ${input.query}

Provide your response:`
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
    const aiResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 
      'I apologize, but I cannot provide a response at this moment. Please try again.';
    
    // Extract structured medicine data if present
    let medicineData = undefined;
    const dataMatch = aiResponse.match(/---MEDICINE_DATA---([\s\S]*?)---END_DATA---/);
    if (dataMatch) {
      try {
        const jsonData = JSON.parse(dataMatch[1].trim());
        if (jsonData.isValidMedicine) {
          medicineData = jsonData;
        }
      } catch (e) {
        console.log('Could not parse medicine data:', e);
      }
    }
    
    // Remove the data markers from the visible response
    const cleanResponse = aiResponse.replace(/---MEDICINE_DATA---[\s\S]*?---END_DATA---/g, '').trim();
    
    return {
      response: cleanResponse,
      medicineData: medicineData
    };
  } catch (error) {
    console.error('Chatbot error:', error);
    // Fallback response on error
    return {
      response: `I'm experiencing technical difficulties. For accurate medical information about medicines, please consult a licensed healthcare professional or pharmacist. They can provide personalized information based on your specific health needs.`
    };
  }
}

const medicineQueryChatbotPrompt = ai.definePrompt({
  name: 'medicineQueryChatbotPrompt',
  input: {schema: MedicineQueryChatbotInputSchema},
  output: {schema: MedicineQueryChatbotOutputSchema},
  model: 'googleai/gemini-1.5-flash-002', // Specify model directly
  prompt: `You are a medical information assistant providing accurate, concise information about medicines.

CRITICAL: Provide brief (2-4 sentences), factual answers. Use bullet points for lists. Double-check accuracy.
Always end with: "Consult a healthcare professional for personalized advice."

Query: {{query}}`,
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

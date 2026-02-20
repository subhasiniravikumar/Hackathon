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

CRITICAL INSTRUCTIONS:
- Provide CONCISE, factual answers (2-4 sentences maximum)
- Double-check accuracy - medicine information must be precise
- Use bullet points for lists (dosage, side effects, etc.)
- State facts clearly without unnecessary elaboration
- Always end with: "Consult a healthcare professional for personalized advice."

User Query: ${input.query}

Provide a brief, accurate response:`
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
    
    return {
      response: aiResponse
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

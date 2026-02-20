import { Medicine } from '@/types/medicine';

/**
 * Add AI-verified medicine to the database
 */
export async function addAIVerifiedMedicine(
  medicineData: Partial<Medicine>,
  userId: string
): Promise<{ success: boolean; medicine?: Medicine; error?: string }> {
  try {
    const response = await fetch('/api/medicines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        medicine: medicineData,
        userId: userId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to add medicine',
      };
    }

    return {
      success: true,
      medicine: data.medicine,
    };
  } catch (error) {
    console.error('Error adding AI-verified medicine:', error);
    return {
      success: false,
      error: 'Network error',
    };
  }
}

/**
 * Get all AI-verified medicines
 */
export async function getAIVerifiedMedicines(): Promise<Medicine[]> {
  try {
    const response = await fetch('/api/medicines');
    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to fetch AI-verified medicines:', data.error);
      return [];
    }

    return data.medicines || [];
  } catch (error) {
    console.error('Error fetching AI-verified medicines:', error);
    return [];
  }
}

/**
 * Parse AI response to extract medicine details
 */
export function parseAIMedicineResponse(aiResponse: string): Partial<Medicine> | null {
  try {
    // Try to extract JSON from the AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const medicineData = JSON.parse(jsonMatch[0]);
      return medicineData;
    }

    // If no JSON, try to parse text response
    const medicine: Partial<Medicine> = {};
    
    // Extract brand name
    const brandMatch = aiResponse.match(/brand\s*name[:\s]+([^\n]+)/i);
    if (brandMatch) medicine.brandName = brandMatch[1].trim();

    // Extract generic name
    const genericMatch = aiResponse.match(/generic\s*name[:\s]+([^\n]+)/i);
    if (genericMatch) medicine.genericName = genericMatch[1].trim();

    // Extract dosage
    const dosageMatch = aiResponse.match(/dosage[:\s]+([^\n]+)/i);
    if (dosageMatch) medicine.dosage = dosageMatch[1].trim();

    // Extract category
    const categoryMatch = aiResponse.match(/category[:\s]+([^\n]+)/i);
    if (categoryMatch) medicine.category = categoryMatch[1].trim();

    // Extract uses
    const usesMatch = aiResponse.match(/uses?[:\s]+([^\n]+)/i);
    if (usesMatch) medicine.uses = usesMatch[1].trim();

    // Extract side effects
    const sideEffectsMatch = aiResponse.match(/side\s*effects?[:\s]+([^\n]+)/i);
    if (sideEffectsMatch) medicine.sideEffects = sideEffectsMatch[1].trim();

    // Extract price
    const priceMatch = aiResponse.match(/price[:\s]+([^\n]+)/i);
    if (priceMatch) medicine.price = priceMatch[1].trim();

    return medicine.brandName && medicine.genericName ? medicine : null;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return null;
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Medicine } from '@/types/medicine';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { medicine, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!medicine || !medicine.brandName || !medicine.genericName) {
      return NextResponse.json(
        { error: 'Invalid medicine data' },
        { status: 400 }
      );
    }

    // Create the medicine object with required fields
    const newMedicine: Medicine = {
      id: `med_ai_${Date.now()}`,
      brandName: medicine.brandName,
      genericName: medicine.genericName,
      dosage: medicine.dosage || 'As prescribed',
      category: medicine.category || 'General',
      uses: medicine.uses || '',
      sideEffects: medicine.sideEffects || 'Consult doctor for details',
      price: medicine.price || 'Varies',
      warnings: medicine.warnings || 'Consult doctor before use. Side effects vary per patient.',
      language: medicine.language || ['English'],
      aiVerified: true, // Mark as AI-verified
      addedBy: userId,
      addedAt: new Date().toISOString(),
    };

    // Read current medicine data
    const dataPath = path.join(process.cwd(), 'public', 'data', 'medicineData.json');
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const medicines: Medicine[] = JSON.parse(fileContent);

    // Check if medicine already exists
    const existingMedicine = medicines.find(
      (m) => 
        m.brandName.toLowerCase() === newMedicine.brandName.toLowerCase() ||
        m.genericName.toLowerCase() === newMedicine.genericName.toLowerCase()
    );

    if (existingMedicine) {
      return NextResponse.json(
        { error: 'Medicine already exists in database', medicine: existingMedicine },
        { status: 409 }
      );
    }

    // Add new medicine
    medicines.push(newMedicine);

    // Write back to file
    await fs.writeFile(dataPath, JSON.stringify(medicines, null, 2), 'utf-8');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Medicine added to database successfully',
        medicine: newMedicine 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error adding medicine:', error);
    return NextResponse.json(
      { error: 'Failed to add medicine to database' },
      { status: 500 }
    );
  }
}

// Get AI-verified medicines
export async function GET(request: NextRequest) {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'medicineData.json');
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const medicines: Medicine[] = JSON.parse(fileContent);

    // Filter AI-verified medicines
    const aiVerifiedMedicines = medicines.filter((m: any) => m.aiVerified === true);

    return NextResponse.json(
      { 
        success: true,
        count: aiVerifiedMedicines.length,
        medicines: aiVerifiedMedicines 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching AI-verified medicines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medicines' },
      { status: 500 }
    );
  }
}

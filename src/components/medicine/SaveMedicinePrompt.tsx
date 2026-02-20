"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Database } from 'lucide-react';
import { addAIVerifiedMedicine } from '@/services/medicine-ai-service';
import { Medicine } from '@/types/medicine';
import { useToast } from '@/hooks/use-toast';

interface SaveMedicinePromptProps {
  medicineData: Partial<Medicine>;
  userId: string;
  onSaved?: (medicine: Medicine) => void;
  onDismiss?: () => void;
}

export function SaveMedicinePrompt({ 
  medicineData, 
  userId, 
  onSaved, 
  onDismiss 
}: SaveMedicinePromptProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<'success' | 'error' | null>(null);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    
    const result = await addAIVerifiedMedicine(medicineData, userId);
    
    setIsSaving(false);

    if (result.success && result.medicine) {
      setSaveResult('success');
      toast({
        title: "Medicine saved!",
        description: "This medicine has been added to our database.",
      });
      onSaved?.(result.medicine);
    } else {
      setSaveResult('error');
      toast({
        title: "Could not save",
        description: result.error || "Medicine may already exist in database.",
        variant: "destructive",
      });
    }
  };

  if (saveResult === 'success') {
    return (
      <Alert className="mb-4 border-green-500 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Saved to Database</AlertTitle>
        <AlertDescription className="text-green-700">
          This medicine information has been verified and added to our database.
        </AlertDescription>
      </Alert>
    );
  }

  if (saveResult === 'error') {
    return (
      <Alert className="mb-4 border-red-500 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Not Saved</AlertTitle>
        <AlertDescription className="text-red-700">
          Could not save to database. Medicine may already exist.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-blue-500 bg-blue-50">
      <Database className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">Add to Database?</AlertTitle>
      <AlertDescription className="text-blue-700 space-y-2">
        <p className="text-sm">
          Would you like to add "{medicineData.brandName || medicineData.genericName}" to our medicine database?
          This will help other users find this medicine.
        </p>
        <div className="flex gap-2 mt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Database className="mr-2 h-3 w-3" />
                Add to Database
              </>
            )}
          </Button>
          <Button
            onClick={onDismiss}
            disabled={isSaving}
            variant="outline"
            size="sm"
          >
            Skip
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

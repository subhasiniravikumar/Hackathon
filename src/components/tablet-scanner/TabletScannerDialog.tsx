
"use client";

import * as React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Camera, RefreshCw, Send, AlertTriangle, Pill, UploadCloud, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Medicine } from '@/types/medicine';
import { getMedicineDetails, type MedicineDetailsInput, type MedicineDetailsOutput } from '@/ai/flows/medicine-details-flow';
import { MedicineCard } from '@/components/medicine/MedicineCard';

interface TabletScannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  allMedicines: Medicine[];
}

export function TabletScannerDialog({ isOpen, onClose, allMedicines }: TabletScannerDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessingRecognition, setIsProcessingRecognition] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [recognizedMedicineFromDB, setRecognizedMedicineFromDB] = useState<Medicine | null>(null);
  const [aiIdentifiedName, setAiIdentifiedName] = useState<string | null>(null);
  const [aiGeneratedDetails, setAiGeneratedDetails] = useState<MedicineDetailsOutput | null>(null);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);


  const resetState = useCallback(() => {
    setSelectedImage(null);
    setRecognizedMedicineFromDB(null);
    setAiIdentifiedName(null);
    setAiGeneratedDetails(null);
    setRecognitionError(null);
    setIsProcessingRecognition(false);
    setIsFetchingDetails(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  }, []);

  const handleCloseDialog = () => {
    resetState();
    onClose();
  };
  
  const handleFileSelected = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select an image file.' });
        if (event.target) event.target.value = ''; 
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setRecognizedMedicineFromDB(null);
        setAiIdentifiedName(null);
        setAiGeneratedDetails(null);
        setRecognitionError(null);
        toast({ title: 'Image Selected', description: 'Ready to recognize.' });
      };
      reader.onerror = () => {
        toast({ variant: 'destructive', title: 'File Error', description: 'Could not read the selected file.' });
      };
      reader.readAsDataURL(file);
    }
    if (event.target) { 
        event.target.value = '';
    }
  }, [toast]);

  const handleClearImage = useCallback(() => {
    setSelectedImage(null);
    setRecognizedMedicineFromDB(null);
    setAiIdentifiedName(null);
    setAiGeneratedDetails(null);
    setRecognitionError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click(); 
  }, []);

  const handleRecognizeTabletAndFetchDetails = useCallback(async () => {
    if (!selectedImage) return;

    setIsProcessingRecognition(true);
    setRecognizedMedicineFromDB(null);
    setAiIdentifiedName(null);
    setAiGeneratedDetails(null);
    setRecognitionError(null);

    try {
      // Use Gemini AI to identify medicine from image - Direct v1 API call
      toast({ title: 'AI Processing', description: 'Identifying tablet with Gemini AI...' });
      
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY || '';
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];
      
      // Direct REST API call to v1 endpoint (bypassing SDK v1beta issue)
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
                    text: 'Identify this medicine tablet/pill. Provide ONLY the medicine name (brand or generic). If you cannot identify it, respond with "Unknown medicine".'
                  },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data
                    }
                  }
                ]
              }
            ]
          })
        }
      );

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(`Gemini API Error: ${errorData.error?.message || apiResponse.statusText}`);
      }

      const responseData = await apiResponse.json();
      const rawAiMedicineName = responseData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Unknown medicine';
      
      console.log('AI identified medicine:', rawAiMedicineName);

      if (rawAiMedicineName.toLowerCase().includes('unknown') || rawAiMedicineName.toLowerCase().includes('cannot identify')) {
        setRecognitionError(`AI: ${rawAiMedicineName}`);
        toast({ variant: 'default', title: 'Recognition Result', description: rawAiMedicineName });
        setIsProcessingRecognition(false);
        return;
      }
      
      // Try to find in DB using AI-identified name
      const normalizedName = rawAiMedicineName.toLowerCase();
      let foundMedicine: Medicine | null | undefined = null;

      // Search for medicines matching the AI response
      foundMedicine = allMedicines.find(med => 
        normalizedName.includes(med.brandName.toLowerCase()) || 
        med.brandName.toLowerCase().includes(normalizedName)
      ) || allMedicines.find(med => 
        normalizedName.includes(med.genericName.toLowerCase()) ||
        med.genericName.toLowerCase().includes(normalizedName)
      );
      
      setIsProcessingRecognition(false); // Recognition part is done

      if (foundMedicine) {
        setRecognizedMedicineFromDB(foundMedicine);
        toast({ title: 'Tablet Recognized!', description: `${foundMedicine.brandName} (AI match)` });
      } else {
        // Not in DB, use AI name to fetch details
        setAiIdentifiedName(rawAiMedicineName);
        toast({ title: 'AI Identified', description: `"${rawAiMedicineName}" - Not in DB, fetching details...` });
        
        setIsFetchingDetails(true);
        try {
          const detailsInput: MedicineDetailsInput = { medicineName: rawAiMedicineName };
          const detailsResult = await getMedicineDetails(detailsInput);
          setAiGeneratedDetails(detailsResult);
          toast({ title: 'Details Retrieved', description: `Showing info for "${rawAiMedicineName}".` });
        } catch (detailsError) {
          console.error('Error fetching medicine details:', detailsError);
          setRecognitionError(`AI identified: "${rawAiMedicineName}". Could not fetch details.`);
          toast({ variant: 'destructive', title: 'Details Fetch Error', description: 'Failed to get details.' });
        } finally {
          setIsFetchingDetails(false);
        }
      }
    } catch (error) {
      console.error('Error recognizing tablet:', error);
      setRecognitionError('An error occurred during AI recognition. Please try again.');
      toast({ variant: 'destructive', title: 'AI Error', description: 'Failed to process image with AI.' });
      setIsProcessingRecognition(false);
      setIsFetchingDetails(false);
    }
  }, [selectedImage, allMedicines, toast]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  const isProcessing = isProcessingRecognition || isFetchingDetails;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleCloseDialog();
    }}>
      <DialogContent className="sm:max-w-[550px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl flex items-center"><Camera className="mr-2 h-6 w-6 text-primary" /> Tablet Scanner</DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {!selectedImage && (
            <Button onClick={triggerFileInput} className="w-full" size="lg" variant="outline">
              <UploadCloud className="mr-2 h-5 w-5" /> Select Image / Use Camera
            </Button>
          )}
          
          {selectedImage && (
            <>
              <div className="relative aspect-video bg-muted rounded-md overflow-hidden border">
                <img src={selectedImage} alt="Selected tablet" className="w-full h-full object-contain" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button onClick={handleRecognizeTabletAndFetchDetails} className="w-full sm:col-span-2" disabled={isProcessing} size="lg">
                  {isProcessingRecognition ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                  {isProcessingRecognition ? 'Recognizing...' : (isFetchingDetails ? 'Fetching Details...' : 'Recognize This Image')}
                </Button>
                <Button onClick={handleClearImage} variant="outline" className="w-full col-span-2" disabled={isProcessing}>
                  <RefreshCw className="mr-2 h-5 w-5" /> Clear / Choose Different Image
                </Button>
              </div>
            </>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelected}
          />

          {(isProcessingRecognition || isFetchingDetails) && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">
                {isProcessingRecognition ? 'Recognizing tablet...' : 'Fetching details from AI...'}
              </p>
            </div>
          )}
          
          {/* Display recognized medicine from DB */}
          {recognizedMedicineFromDB && !isProcessing && (
             <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2 text-primary flex items-center"><Pill className="mr-2 h-5 w-5"/>Recognized (Database):</h3>
                <MedicineCard medicine={recognizedMedicineFromDB} />
             </div>
          )}

          {/* Display AI-identified name and its fetched details if not in DB */}
          {aiIdentifiedName && aiGeneratedDetails && !recognizedMedicineFromDB && !isProcessing && (
            <div className="mt-4 space-y-3 p-4 border rounded-md bg-secondary/50 shadow">
              <h3 className="text-lg font-semibold text-primary flex items-center">
                <Info className="mr-2 h-5 w-5"/>AI Information for: <span className="font-bold ml-1">{aiIdentifiedName}</span>
              </h3>
              <div className="space-y-1 text-sm">
                <p><strong className="text-foreground">General Description:</strong> {aiGeneratedDetails.generalDescription}</p>
                <p><strong className="text-foreground">Uses:</strong> {aiGeneratedDetails.uses}</p>
                <p><strong className="text-foreground">Pros:</strong> {aiGeneratedDetails.pros}</p>
                <p><strong className="text-foreground">Cons:</strong> {aiGeneratedDetails.cons}</p>
              </div>
              <Alert variant="default" className="mt-3 bg-background">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertTitle className="text-yellow-600">Disclaimer</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  This information is AI-generated as the medicine was not found in our curated database. Always consult a healthcare professional.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {/* Display recognition error if any, and no other successful result is shown */}
          {recognitionError && !isProcessing && !recognizedMedicineFromDB && !aiGeneratedDetails && (
            <Alert variant="default" className="border-yellow-500/50 text-yellow-700 dark:border-yellow-400/50 dark:text-yellow-300 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Recognition Info</AlertTitle>
              <AlertDescription>{recognitionError}</AlertDescription>
            </Alert>
          )}

        </div>
        <DialogFooter className="p-6 pt-4 border-t">
          <DialogClose asChild>
            <Button variant="outline" onClick={handleCloseDialog}>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

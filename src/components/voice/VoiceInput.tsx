"use client";

import type * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LanguageSelector } from './LanguageSelector';
import { getMedicineSimilarityScore } from '@/lib/fuzzy-search';
import type { Medicine } from '@/types/medicine';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  setGlobalSearchTerm: (term: string) => void;
  preferredLanguage: string;
  onPreferredLanguageChange: (lang: string) => void;
  medicines?: Medicine[];
}

// Check if SpeechRecognition is available in the browser
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;

export function VoiceInput({ 
  onTranscript, 
  setGlobalSearchTerm, 
  preferredLanguage, 
  onPreferredLanguageChange,
  medicines = []
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isApiAvailable, setIsApiAvailable] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Function to find best matching medicine name
  const findBestMatch = useCallback((transcript: string): string => {
    if (!medicines.length) return transcript;

    const lowerTranscript = transcript.toLowerCase();
    
    // First check for exact matches (case-insensitive)
    for (const medicine of medicines) {
      const lowerBrand = medicine.brandName.toLowerCase();
      const lowerGeneric = medicine.genericName.toLowerCase();
      
      // Exact match - no need to auto-correct
      if (lowerBrand === lowerTranscript || lowerGeneric === lowerTranscript) {
        return transcript;
      }
      
      // Check if transcript is contained in brand name (e.g., "Paracetamol" in "Paracetamol 500mg")
      if (lowerBrand.includes(lowerTranscript) && lowerTranscript.length > 3) {
        return transcript;
      }
    }

    // No exact match found, try fuzzy matching
    let bestMatch = transcript;
    let highestScore = 0.6; // Minimum threshold

    for (const medicine of medicines) {
      const brandScore = getMedicineSimilarityScore(medicine, transcript, 'brandName');
      const genericScore = getMedicineSimilarityScore(medicine, transcript, 'genericName');
      const maxScore = Math.max(brandScore, genericScore);

      if (maxScore > highestScore) {
        highestScore = maxScore;
        bestMatch = brandScore > genericScore ? medicine.brandName : medicine.genericName;
      }
    }

    if (highestScore > 0.6 && bestMatch !== transcript) {
      console.log(`Auto-corrected "${transcript}" → "${bestMatch}" (${Math.round(highestScore * 100)}% match)`);
      return bestMatch;
    }

    return transcript;
  }, [medicines]);

  useEffect(() => {
    if (SpeechRecognition) {
      setIsApiAvailable(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = preferredLanguage;
      recognition.maxAlternatives = 5; // Get multiple alternatives

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const alternatives = event.results[0];
        console.log('Speech alternatives:', Array.from(alternatives).map((alt: any) => 
          `"${alt.transcript}" (${Math.round(alt.confidence * 100)}%)`
        ).join(', '));

        // Check all alternatives and find the best medicine match
        let bestOverallMatch = alternatives[0].transcript;
        let bestOverallScore = 0;
        let matchFound = false;

        for (let i = 0; i < alternatives.length; i++) {
          const transcript = alternatives[i].transcript.trim().replace(/[.,!?;:\s]+$/g, '');
          const correctedTranscript = findBestMatch(transcript);
          
          // If auto-correction happened, it means we found a good medicine match
          if (correctedTranscript !== transcript) {
            bestOverallMatch = correctedTranscript;
            matchFound = true;
            console.log(`Found medicine match in alternative ${i + 1}: "${transcript}" → "${correctedTranscript}"`);
            break;
          }
          
          // Otherwise check if the transcript itself is a medicine name
          const lowerTranscript = transcript.toLowerCase();
          const isDirectMatch = medicines.some(med => 
            med.brandName.toLowerCase().includes(lowerTranscript) || 
            med.genericName.toLowerCase().includes(lowerTranscript)
          );
          
          if (isDirectMatch && lowerTranscript.length > 3) {
            bestOverallMatch = transcript;
            matchFound = true;
            console.log(`Direct medicine match in alternative ${i + 1}: "${transcript}"`);
            break;
          }
        }

        // If no medicine match found in any alternative, use the first one
        if (!matchFound) {
          const firstTranscript = alternatives[0].transcript.trim().replace(/[.,!?;:\s]+$/g, '');
          bestOverallMatch = findBestMatch(firstTranscript);
        }

        const originalFirst = alternatives[0].transcript.trim().replace(/[.,!?;:\s]+$/g, '');
        
        setGlobalSearchTerm(bestOverallMatch);
        toast({ 
          title: "Voice search", 
          description: bestOverallMatch !== originalFirst
            ? `"${originalFirst}" → "${bestOverallMatch}"` 
            : `Searching for "${bestOverallMatch}"` 
        });
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
          console.log('No speech detected');
          toast({ 
            title: "No speech detected", 
            description: "Please try speaking again.",
            variant: "destructive" 
          });
        } else if (event.error === 'not-allowed') {
          console.error('Speech recognition error:', event.error);
          toast({ 
            title: "Microphone access denied", 
            description: "Please allow microphone access.",
            variant: "destructive" 
          });
        } else if (event.error !== 'aborted') {
          console.error('Speech recognition error:', event.error);
          toast({ 
            title: "Speech recognition error", 
            description: event.error,
            variant: "destructive" 
          });
        }
        setIsListening(false);
      };
    
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsApiAvailable(false);
    }
  }, [preferredLanguage, setGlobalSearchTerm, toast, findBestMatch]);

  const handleToggleListening = useCallback(() => {
    if (!isApiAvailable || !recognitionRef.current) {
      toast({ 
        title: "Voice input unavailable", 
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive" 
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.lang = preferredLanguage;
        recognitionRef.current.start();
        toast({ 
          title: "🎤 Listening...", 
          description: "Speak now. Will auto-stop when you finish." 
        });
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast({ 
          title: "Error", 
          description: "Could not start voice input.",
          variant: "destructive" 
        });
      }
    }
  }, [isApiAvailable, isListening, preferredLanguage, toast]);

  if (!isApiAvailable) {
    return (
      <div className="my-4 p-4 border rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">
          Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 my-4">
      <Button
        onClick={handleToggleListening}
        variant={isListening ? "destructive" : "default"}
        size="lg"
        className={`w-full sm:w-auto transition-all ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-accent hover:bg-accent/90'
        } text-accent-foreground`}
        aria-label={isListening ? "Stop listening" : "Start voice search"}
      >
        {isListening ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Listening...
          </>
        ) : (
          <>
            <Mic className="mr-2 h-5 w-5" /> Voice Search
          </>
        )}
      </Button>
      <LanguageSelector 
        currentLanguage={preferredLanguage} 
        onLanguageChange={onPreferredLanguageChange}
        disabled={isListening}
      />
      {isListening && (
        <span className="text-sm text-muted-foreground animate-pulse">
          Speak now...
        </span>
      )}
    </div>
  );
}

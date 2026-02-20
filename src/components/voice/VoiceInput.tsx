"use client";

import type * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LanguageSelector } from './LanguageSelector';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  setGlobalSearchTerm: (term: string) => void; // To update search bar directly
  preferredLanguage: string;
  onPreferredLanguageChange: (lang: string) => void;
}

// Check if SpeechRecognition is available in the browser
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;

export function VoiceInput({ 
  onTranscript, 
  setGlobalSearchTerm, 
  preferredLanguage, 
  onPreferredLanguageChange 
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isApiAvailable, setIsApiAvailable] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (SpeechRecognition) {
      setIsApiAvailable(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = preferredLanguage;

      recognition.onresult = (event) => {
        const rawTranscript = event.results[0][0].transcript;
        // Clean transcript: trim whitespace and remove all trailing punctuation
        const cleanedTranscript = rawTranscript.trim().replace(/[.,!?;:\s]+$/g, '');
        console.log('Raw transcript:', rawTranscript);
        console.log('Cleaned transcript:', cleanedTranscript);
        onTranscript(cleanedTranscript);
        setGlobalSearchTerm(cleanedTranscript); // Update search bar with voice input
        setIsListening(false);
        toast({ title: "Voice input received", description: `"${cleanedTranscript}"` });
      };

      recognition.onerror = (event) => {
        let errorMessage = 'Speech recognition error.';
        
        if (event.error === 'no-speech') {
          errorMessage = 'No speech was detected. Please try again.';
          console.log('Speech recognition: no speech detected');
        } else if (event.error === 'audio-capture') {
          errorMessage = 'Audio capture failed. Please ensure microphone access.';
          console.error('Speech recognition error:', event.error);
        } else if (event.error === 'not-allowed') {
          errorMessage = 'Microphone access denied. Please allow access in browser settings.';
          console.error('Speech recognition error:', event.error);
        } else if (event.error === 'aborted') {
          // User stopped listening, no need to show error
          setIsListening(false);
          return;
        } else {
          console.error('Speech recognition error:', event.error);
        }
        
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
        setIsListening(false);
      };
      
      recognition.onend = () => {
        if (isListening) { // if it ended unexpectedly
           // setIsListening(false); // Already handled in onresult and onerror
        }
      };

      setRecognitionInstance(recognition);
    } else {
      setIsApiAvailable(false);
      toast({ title: "Voice input not supported", description: "Your browser does not support voice recognition.", variant: "destructive" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferredLanguage]); // Re-initialize if language changes

  const handleToggleListening = useCallback(async () => {
    if (!isApiAvailable || !recognitionInstance) {
      toast({ title: "Voice input unavailable", description: "Speech recognition is not available or not initialized.", variant: "destructive" });
      return;
    }

    if (isListening) {
      recognitionInstance.stop();
      setIsListening(false);
    } else {
      try {
        // Check for microphone permission
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permissionStatus.state === 'denied') {
          toast({ title: "Microphone Access Denied", description: "Please allow microphone access in your browser settings.", variant: "destructive"});
          return;
        }
        if (permissionStatus.state === 'prompt') {
           // Request permission by starting capture; browser will show prompt
           await navigator.mediaDevices.getUserMedia({ audio: true });
        }

        recognitionInstance.lang = preferredLanguage; // Ensure language is current
        recognitionInstance.start();
        setIsListening(true);
        toast({ title: "Listening...", description: "Speak now." });
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast({ title: "Microphone Error", description: "Could not start voice input. Check microphone permissions.", variant: "destructive" });
        setIsListening(false);
      }
    }
  }, [isApiAvailable, recognitionInstance, isListening, toast, preferredLanguage]);
  
  const handleLanguageChange = (lang: string) => {
    onPreferredLanguageChange(lang);
    if (recognitionInstance) {
      recognitionInstance.lang = lang;
    }
  };

  if (!isApiAvailable) {
    return <p className="text-sm text-muted-foreground">Voice input not supported by your browser.</p>;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 my-4">
      <Button
        onClick={handleToggleListening}
        variant={isListening ? "destructive" : "default"}
        size="lg"
        className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
        aria-label={isListening ? "Stop listening" : "Start voice input"}
      >
        {isListening ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Listening...
          </>
        ) : (
          <>
            <Mic className="mr-2 h-5 w-5" /> Speak Query
          </>
        )}
      </Button>
      <LanguageSelector 
        currentLanguage={preferredLanguage} 
        onLanguageChange={handleLanguageChange}
        disabled={isListening}
      />
    </div>
  );
}

"use client";

import type * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Mic, X, Loader2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { medicineQueryChatbot, type MedicineQueryChatbotInput } from '@/ai/flows/medicine-query-chatbot';
import { useToast } from '@/hooks/use-toast';
import { LanguageSelector } from '@/components/voice/LanguageSelector';
import { addAIVerifiedMedicine } from '@/services/medicine-ai-service';
import { useAuth } from '@/contexts/AuthContext';
import type { Medicine } from '@/types/medicine';

interface ChatbotInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onMedicineAdded?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

// Check if SpeechRecognition is available in the browser
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;

export function ChatbotInterface({ isOpen, onClose, onMedicineAdded }: ChatbotInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const rawTranscript = event.results[0][0].transcript;
        const cleanedTranscript = rawTranscript.trim().replace(/[.,!?;:\s]+$/g, '');
        setInput(prevInput => prevInput + cleanedTranscript);
        setIsListening(false);
        toast({ title: "Voice input captured: " + cleanedTranscript });
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
          console.log('Chatbot: No speech detected');
        } else if (event.error !== 'aborted') {
          console.error('Chatbot speech recognition error:', event.error);
          toast({ 
            title: "Voice Error", 
            description: event.error,
            variant: "destructive" 
          });
        }
        setIsListening(false);
      };
      
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [toast]);
  
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = voiceLanguage;
    }
  }, [voiceLanguage]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const newUserMessage: Message = { id: Date.now().toString(), sender: 'user', text: trimmedInput };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatbotInput: MedicineQueryChatbotInput = { query: trimmedInput };
      const response = await medicineQueryChatbot(chatbotInput);
      
      const botMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'bot', 
        text: response.response,
      };
      setMessages((prev) => [...prev, botMessage]);
      
      // Automatically save medicine data to database if available and user is authenticated
      if (response.medicineData && response.medicineData.isValidMedicine && 
          response.medicineData.brandName && response.medicineData.genericName && user) {
        
        // Save in background
        const saveResult = await addAIVerifiedMedicine(response.medicineData, user.id);
        
        if (saveResult.success) {
          toast({
            title: "Medicine Added to Database! 🎉",
            description: `${response.medicineData.brandName} has been automatically added to our database.`,
          });
          
          // Notify parent to reload medicines
          onMedicineAdded?.();
          
          // Add a system message about the save
          const systemMessage: Message = {
            id: (Date.now() + 2).toString(),
            sender: 'bot',
            text: `✅ I've automatically added "${response.medicineData.brandName}" to our medicine database. This information is now available to all users!`
          };
          setMessages((prev) => [...prev, systemMessage]);
        } else if (saveResult.error?.includes('already exists')) {
          // Medicine already in database - this is fine, no need to alert user
          console.log('Medicine already in database:', response.medicineData.brandName);
        }
      }
    } catch (error) {
      console.error("Error calling chatbot flow:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        title: "Chatbot Error",
        description: "Could not get a response from the assistant.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, toast, user]);

  const handleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) {
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
        recognitionRef.current.lang = voiceLanguage;
        recognitionRef.current.start();
        setIsListening(true);
        toast({ title: "🎤 Listening...", description: "Speak your question" });
      } catch (error) {
        console.error("Chatbot voice error:", error);
        toast({ 
          title: "Error", 
          description: "Could not start voice input.",
          variant: "destructive" 
        });
      }
    }
  }, [isListening, voiceLanguage, toast]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg h-[80vh] max-h-[700px] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary">MediQuery Assistant</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close chatbot">
            <X className="h-5 w-5" />
          </Button>
        </header>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <ChatMessage sender="bot" text="Hello! How can I help you with your medicine queries today?" />
          {messages.map((msg) => (
            <ChatMessage key={msg.id} sender={msg.sender} text={msg.text} />
          ))}
          {isLoading && <ChatMessage sender="bot" text="" isLoading={true} />}
        </ScrollArea>

        <footer className="p-4 border-t">
           <div className="flex items-center gap-2 mb-2">
            <LanguageSelector 
              currentLanguage={voiceLanguage} 
              onLanguageChange={setVoiceLanguage}
              disabled={isListening || isLoading}
            />
           </div>
          <div className="flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 resize-none text-sm"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <Button 
              size="icon" 
              onClick={handleVoiceInput} 
              disabled={isLoading || !recognitionRef.current} 
              variant={isListening ? "destructive" : "outline"}
              aria-label={isListening ? "Stop voice input" : "Start voice input for chat"}
              className={isListening ? "bg-destructive hover:bg-destructive/90" : "border-primary text-primary hover:bg-primary/10"}
            >
              {isListening ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button 
              size="icon" 
              onClick={handleSendMessage} 
              disabled={isLoading || !input.trim()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              aria-label="Send message"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}

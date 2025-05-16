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

interface ChatbotInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

// Check if SpeechRecognition is available in the browser
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;

export function ChatbotInterface({ isOpen, onClose }: ChatbotInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');
  const [recognitionInstance, setRecognitionInstance] = useState<SpeechRecognition | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prevInput => prevInput + transcript);
        setIsListening(false);
        toast({ title: "Voice input captured." });
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        let errorMessage = 'Speech recognition error.';
        if (event.error === 'no-speech') errorMessage = 'No speech detected.';
        else if (event.error === 'audio-capture') errorMessage = 'Audio capture failed. Check microphone.';
        else if (event.error === 'not-allowed') errorMessage = 'Microphone access denied.';
        toast({ title: "Voice Error", description: errorMessage, variant: "destructive" });
        setIsListening(false);
      };
      
      recognition.onend = () => setIsListening(false);
      setRecognitionInstance(recognition);
    } else {
      // toast({ title: "Voice input not supported", description: "Your browser doesn't support voice recognition in chatbot.", variant: "destructive" });
    }
  }, []);
  
  useEffect(() => {
    if (recognitionInstance) {
      recognitionInstance.lang = voiceLanguage;
    }
  }, [voiceLanguage, recognitionInstance]);


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
      const botMessage: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: response.response };
      setMessages((prev) => [...prev, botMessage]);
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
  }, [input, toast]);

  const handleVoiceInput = useCallback(async () => {
    if (!recognitionInstance) {
      toast({ title: "Voice input unavailable", variant: "destructive" });
      return;
    }
    if (isListening) {
      recognitionInstance.stop();
      setIsListening(false);
    } else {
       try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permissionStatus.state === 'denied') {
          toast({ title: "Mic Access Denied", description: "Allow microphone access in browser settings.", variant: "destructive"});
          return;
        }
        if (permissionStatus.state === 'prompt') {
           await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        recognitionInstance.lang = voiceLanguage;
        recognitionInstance.start();
        setIsListening(true);
        toast({ title: "Listening for chat..." });
      } catch (error) {
        toast({ title: "Mic Error", description: "Could not start voice input for chat.", variant: "destructive" });
        setIsListening(false);
      }
    }
  }, [recognitionInstance, isListening, voiceLanguage, toast]);


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
              disabled={isLoading || !recognitionInstance} 
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

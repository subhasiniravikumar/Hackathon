"use client";

import type * as React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Settings } from 'lucide-react'; // Assuming Settings icon might be used later
import logo from "../../public/data/medicare.png"
import Image from 'next/image';
interface MediQueryHeaderProps {
  onChatbotToggle: () => void;
}

export function MediQueryHeader({ onChatbotToggle }: MediQueryHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center">
        <Image  src={logo} alt="logo" className='size-[50px] object-cover mr-2 '/>
     
          <h1 className="text-2xl font-bold text-foreground">MediCare</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={onChatbotToggle} aria-label="Toggle Chatbot">
          <Bot className="h-6 w-6 text-primary" />
        </Button>
      </div>
    </header>
  );
}

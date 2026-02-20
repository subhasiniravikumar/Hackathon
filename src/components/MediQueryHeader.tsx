"use client";

import type * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, LogIn, LogOut, User } from 'lucide-react';
import logo from "../../public/data/medicare.png"
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from '@/components/auth/AuthDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MediQueryHeaderProps {
  onChatbotToggle: () => void;
}

export function MediQueryHeader({ onChatbotToggle }: MediQueryHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Image  src={logo} alt="logo" className='size-[50px] object-cover mr-2 '/>
            <h1 className="text-2xl font-bold text-foreground">MediCare</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onChatbotToggle} aria-label="Toggle Chatbot">
              <Bot className="h-6 w-6 text-primary" />
            </Button>
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    {user?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" onClick={() => setShowAuthDialog(true)}>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
      />
    </>
  );
}

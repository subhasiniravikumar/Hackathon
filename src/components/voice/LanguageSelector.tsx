'use client';

import type * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  disabled?: boolean;
}

export function LanguageSelector({ currentLanguage, onLanguageChange, disabled }: LanguageSelectorProps) {
  return (
    <Select value={currentLanguage} onValueChange={onLanguageChange} disabled={disabled}>
      <SelectTrigger className="w-[180px] text-sm">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en-US">English (US)</SelectItem>
        <SelectItem value="en-IN">English (India)</SelectItem>
        <SelectItem value="ta-IN">தமிழ் (Tamil - India)</SelectItem>
      </SelectContent>
    </Select>
  );
}

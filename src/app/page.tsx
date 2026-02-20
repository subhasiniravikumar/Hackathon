
"use client";

import *
as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { MediQueryHeader } from '@/components/MediQueryHeader';
// import { MedicineSearch } from '@/components/medicine/MedicineSearch'; // No longer used
import { VoiceInput } from '@/components/voice/VoiceInput';
import { MedicineListDisplay } from '@/components/medicine/MedicineListDisplay';
import { ChatbotInterface } from '@/components/chatbot/ChatbotInterface';
import { TabletScannerDialog } from '@/components/tablet-scanner/TabletScannerDialog';
import { AuthDialog } from '@/components/auth/AuthDialog';
import type { Medicine } from '@/types/medicine';
import { Button } from '@/components/ui/button';
import { Bot, Search, Pill, Camera } from 'lucide-react'; // Added Camera icon
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { fuzzyMatch, getMedicineSimilarityScore } from '@/lib/fuzzy-search';
import { useAuth } from '@/contexts/AuthContext';


// Helper function to load medicine data
async function loadMedicines(): Promise<Medicine[]> {
  try {
    const response = await fetch('/data/medicineData.json');
    if (!response.ok) {
      console.error('Failed to load medicine data:', response.statusText);
      return [];
    }
    const data = await response.json();
    return data as Medicine[];
  } catch (error) {
    console.error('Error fetching medicine data:', error);
    return [];
  }
}

// Categories based on medicineData.json
const QUICK_CATEGORIES = ["Painkiller", "Antibiotic", "Antihistamine", "Antacid", "Antidiabetic", "Antihypertensive"];


export default function Home() {
  const { isAuthenticated } = useAuth();
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isTabletScannerOpen, setIsTabletScannerOpen] = useState(false); // State for Tablet Scanner Dialog
  const [showAuthDialog, setShowAuthDialog] = useState(false); // Auth dialog for AI features
  const [preferredVoiceLanguage, setPreferredVoiceLanguage] = useState('en-US'); // Default language
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openCommand, setOpenCommand] = React.useState(false)


  useEffect(() => {
    loadMedicines().then(setAllMedicines);
    // Load preferred language from localStorage if available
    const storedLang = localStorage.getItem('preferredVoiceLanguage');
    if (storedLang) {
      setPreferredVoiceLanguage(storedLang);
    }
  }, []);

  const handlePreferredLanguageChange = (lang: string) => {
    setPreferredVoiceLanguage(lang);
    localStorage.setItem('preferredVoiceLanguage', lang); // Save preference
  };

  const filteredMedicines = useMemo(() => {
    let medicinesToFilter = allMedicines;

    if (activeCategory) {
      medicinesToFilter = medicinesToFilter.filter(
        (med) => med.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    
    if (!searchTerm && !activeCategory) return allMedicines.slice(0, 6); // Show some initial medicines
    if (!searchTerm && activeCategory) return medicinesToFilter; // Show all from category if no search term

    // Use fuzzy matching for better speech recognition support
    const matches = medicinesToFilter
      .filter((medicine) => fuzzyMatch(medicine, searchTerm, 0.6))
      .map((medicine) => ({
        medicine,
        score: getMedicineSimilarityScore(medicine, searchTerm)
      }))
      .sort((a, b) => b.score - a.score) // Sort by relevance
      .map(({ medicine }) => medicine);

    return matches;
  }, [allMedicines, searchTerm, activeCategory]);

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
    if (term) setActiveCategory(null); // Clear category filter if user types a search
    setOpenCommand(true); //open the command
  };
  
  const handleVoiceTranscript = (transcript: string) => {
    setSearchTerm(transcript); // Update search term with voice input
    setActiveCategory(null); // Clear category filter on voice input
    setOpenCommand(true);
  };

  const toggleChatbot = useCallback(() => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setIsChatbotOpen((prev) => !prev);
  }, [isAuthenticated]);

  const handleMedicineAdded = useCallback(() => {
    // Reload medicines when a new one is added via AI
    loadMedicines().then(setAllMedicines);
  }, []);

  const handleCategoryClick = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null); // Toggle off if already active
      setSearchTerm(''); // Clear search term when deselecting category
    } else {
      setActiveCategory(category);
      setSearchTerm(''); // Clear search term when selecting a new category
    }
    setOpenCommand(false);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    setOpenCommand(false); // Close the Command component after selection
  };

  const suggestedMedicines = useMemo(() => {
    if (!searchTerm) return [];
    
    // Use fuzzy matching for suggestions
    return allMedicines
      .filter((medicine) => fuzzyMatch(medicine, searchTerm, 0.5)) // Lower threshold for suggestions
      .map((medicine) => ({
        medicine,
        score: getMedicineSimilarityScore(medicine, searchTerm)
      }))
      .sort((a, b) => b.score - a.score) // Sort by relevance
      .slice(0, 5) // Limit to top 5 suggestions
      .map(({ medicine }) => medicine);
  }, [searchTerm, allMedicines]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MediQueryHeader onChatbotToggle={toggleChatbot} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold text-center text-primary mb-2">
            Your AI-Powered Medicine Assistant
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            Search for medicines, scan a tablet, ask our chatbot, or use voice commands.
          </p>

          <Command className="mb-4">
              <CommandInput placeholder="Search medicines by name, use, category..." value={searchTerm} onValueChange={handleSearchTermChange} />
              <CommandList>
                <CommandEmpty>
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">No results found in our database.</p>
                    <Button 
                      onClick={() => {
                        if (!isAuthenticated) {
                          setOpenCommand(false);
                          setShowAuthDialog(true);
                          return;
                        }
                        setOpenCommand(false);
                        toggleChatbot();
                      }}
                      variant="default"
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Bot className="mr-2 h-4 w-4" /> Ask AI for Details
                    </Button>
                  </div>
                </CommandEmpty>
                {searchTerm && suggestedMedicines.length > 0 && (
                  <CommandGroup heading="Suggestions">
                    {suggestedMedicines.map((medicine) => (
                      <CommandItem
                        key={medicine.id}
                        value={medicine.brandName}
                        onSelect={() => handleSelectSuggestion(medicine.brandName)}
                      >
                        <Pill className="mr-2 h-4 w-4 text-muted-foreground" />
                        {medicine.brandName}
                        <span className="text-xs text-muted-foreground ml-2">({medicine.genericName})</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              setGlobalSearchTerm={setSearchTerm}
              preferredLanguage={preferredVoiceLanguage}
              onPreferredLanguageChange={handlePreferredLanguageChange}
              medicines={allMedicines}
            />
            <Button 
              onClick={() => {
                if (!isAuthenticated) {
                  setShowAuthDialog(true);
                  return;
                }
                setIsTabletScannerOpen(true);
              }} 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10"
              aria-label="Scan Tablet"
            >
              <Camera className="mr-2 h-5 w-5" /> Scan Tablet
            </Button>
          </div>
          
          <div className="my-6">
            <h3 className="text-lg font-medium text-foreground mb-3">Quick Categories:</h3>
            <div className="flex flex-wrap gap-2">
              {QUICK_CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryClick(category)}
                  className={activeCategory === category ? "bg-primary text-primary-foreground" : "border-primary text-primary hover:bg-primary/10"}
                >
                  <Pill className="mr-2 h-4 w-4" />
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {filteredMedicines.length > 0 || searchTerm || activeCategory ? (
          <MedicineListDisplay medicines={filteredMedicines} />
        ) : (
          <div className="text-center py-10">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              Enter a search term, speak your query, or select a category to find medicines.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              You can also try scanning a tablet using the "Scan Tablet" button.
            </p>
          </div>
        )}


      </main>
      <footer className="py-6 text-center border-t">
        <p className="text-sm text-muted-foreground">
          MediQuery &copy; {new Date().getFullYear()}. For informational purposes only. Always consult a healthcare professional.
        </p>
      </footer>
      <ChatbotInterface 
        isOpen={isChatbotOpen} 
        onClose={toggleChatbot}
        onMedicineAdded={handleMedicineAdded}
      />
      <TabletScannerDialog 
        isOpen={isTabletScannerOpen} 
        onClose={() => setIsTabletScannerOpen(false)}
        allMedicines={allMedicines}
      />
      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)}
        onSuccess={() => {
          // After successful login, check what action was pending
          if (searchTerm && filteredMedicines.length === 0) {
            // User was trying to ask AI about medicine
            setIsChatbotOpen(true);
          }
        }}
      />
    </div>
  );
}

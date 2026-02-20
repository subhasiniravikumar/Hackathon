"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthDialog({ isOpen, onClose, onSuccess }: AuthDialogProps) {
  const { login, signup } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupDateOfBirth, setSignupDateOfBirth] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [detectedAge, setDetectedAge] = useState<number | null>(null);

  // Extract birth year from email and calculate age
  const extractAgeFromEmail = (email: string) => {
    // Look for 4-digit year in email (e.g., john1990@gmail.com, user.2000@yahoo.com)
    const yearMatch = email.match(/\b(19[2-9]\d|20[0-2]\d)\b/);
    
    if (yearMatch) {
      const birthYear = parseInt(yearMatch[1]);
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      
      // Validate that the year makes sense (person would be 0-120 years old)
      if (age >= 0 && age <= 120) {
        setDetectedAge(age);
        // Auto-fill date of birth with January 1st of detected year
        setSignupDateOfBirth(`${birthYear}-01-01`);
        
        if (age < 18) {
          toast({
            title: "Age detected from email",
            description: `You appear to be ${age} years old. You must be 18+ to register.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Age detected from email",
            description: `Birth year ${birthYear} detected (age ${age}). Please verify your date of birth.`,
          });
        }
        return true;
      }
    }
    
    setDetectedAge(null);
    return false;
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email change with automatic age detection
  const handleEmailChange = (email: string) => {
    setSignupEmail(email);
    
    if (email && validateEmail(email)) {
      extractAgeFromEmail(email);
    } else {
      setDetectedAge(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(loginEmail, loginPassword);
    
    setIsLoading(false);

    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      onClose();
      onSuccess?.();
      setLoginEmail('');
      setLoginPassword('');
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format
    if (!validateEmail(signupEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    // Validate age (must be 18+)
    if (!signupDateOfBirth) {
      toast({
        title: "Date of birth required",
        description: "Please enter your date of birth.",
        variant: "destructive",
      });
      return;
    }

    const birthDate = new Date(signupDateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      toast({
        title: "Age restriction",
        description: "You must be 18 years or older to create an account.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const success = await signup(signupEmail, signupPassword, signupName, signupDateOfBirth);
    
    setIsLoading(false);

    if (success) {
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
      onClose();
      onSuccess?.();
      setSignupName('');
      setSignupEmail('');
      setSignupDateOfBirth('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setDetectedAge(null);
    } else {
      toast({
        title: "Signup failed",
        description: "An account with this email already exists.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Authentication Required</DialogTitle>
          <DialogDescription>
            Login or create an account to access AI features. You must be 18 years or older to sign up.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                <LogIn className="mr-2 h-4 w-4" /> {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Your Name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com or john1990@email.com"
                  value={signupEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  required
                />
                {detectedAge !== null && (
                  <p className={`text-xs ${detectedAge >= 18 ? 'text-green-600' : 'text-red-600'}`}>
                    {detectedAge >= 18 
                      ? `✓ Age ${detectedAge} detected from email (eligible)` 
                      : `✗ Age ${detectedAge} detected from email (must be 18+)`
                    }
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-dob">Date of Birth (18+ only)</Label>
                <Input
                  id="signup-dob"
                  type="date"
                  value={signupDateOfBirth}
                  onChange={(e) => setSignupDateOfBirth(e.target.value)}
                  required
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                />
                <p className="text-xs text-muted-foreground">
                  {detectedAge === null ? 'Include birth year in email (e.g., john2000@email.com) for auto-fill' : 'Auto-filled from email - please verify'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                <UserPlus className="mr-2 h-4 w-4" /> {isLoading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

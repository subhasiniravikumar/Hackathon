import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a clean, readable font
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'MediCare - AI Powered Medicine Assistant',
  description: 'Search, scan, or ask about medicines with MediQuery.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

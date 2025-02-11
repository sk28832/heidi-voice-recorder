// src/app/layout.tsx
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Heidi Voice Recorder & Transcription',
  description: 'Record and transcribe voice with offline support',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
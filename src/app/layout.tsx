import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: {
    template: '%s | Midterm Reviewer',
    default: 'Midterm Reviewer',
  },
  description:
    'Interactive academic reviewer for computer science and IT students across all year levels. Practice questions, instant deterministic scoring, and detailed explanations.',
  keywords: [
    'Academic Reviewer',
    'Computer Science',
    'Information Technology',
    'Practice Exam',
    'Interactive Quiz',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B0914',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-[#0B0914] bg-portal-grid text-[#F3F0FA] antialiased flex flex-col font-sans selection:bg-[#8B5CF6]/30 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}

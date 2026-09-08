import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Supabase Mission Control | Next.js Integration',
  description: 'Production-ready Next.js & Supabase integration dashboard with real-time connectivity testing, automated diagnostics, and live CRUD operations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CC — Productivity Calculator',
  description: 'A clean, mobile-friendly productivity calculator',
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

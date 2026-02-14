import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UIForge - Deterministic UI Generator',
  description: 'AI-powered UI generator with iterative modifications',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

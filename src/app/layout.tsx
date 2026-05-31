import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MindFlow — AI Learning Canvas',
  description:
    'An infinite canvas where AI conversations flow as visual graphs. Branch, explore, and build your knowledge tree.',
  keywords: ['AI', 'learning', 'canvas', 'knowledge graph', 'visual learning'],
};

import { Providers } from '@/components/Providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

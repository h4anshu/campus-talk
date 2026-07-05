import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import Providers from '@/components/shared/Providers';

export const metadata: Metadata = {
  title: 'Campus Thread — SITM College Forum',
  description: 'The official student forum for SITM College, Lucknow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster
            style={
              {
                '--normal-bg': 'var(--bg-elevated)',
                '--normal-text': 'var(--text-primary)',
                '--normal-border': 'var(--border)',
                '--border-radius': 'var(--radius)',
              } as React.CSSProperties
            }
          />
        </Providers>
      </body>
    </html>
  );
}

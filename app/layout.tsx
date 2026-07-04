import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'CampusVoice — SITM College Forum',
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
      </body>
    </html>
  );
}

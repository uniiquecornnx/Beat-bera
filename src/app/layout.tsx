import { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from './components/ClientLayout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Beat Bera',
  description: 'Your virtual bear companion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Suspense fallback={null}>
        <body
          className={`${inter.variable} antialiased`}
          suppressHydrationWarning
        >
          <ClientLayout>{children}</ClientLayout>
        </body>
      </Suspense>
    </html>
  );
}

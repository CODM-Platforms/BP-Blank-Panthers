import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'BP Black Panthers',
    template: '%s | BP Black Panthers',
  },
  description: 'Official clan hub for ẞP.ঐ [ BLACK PANTHERS ] CODM Esports.',
  keywords: ['codm', 'esports', 'black panthers', 'clan', 'tournaments'],
  icons: {
    icon: '/logo/BP-BlackPanthers.jpeg',
    apple: '/logo/BP-BlackPanthers.jpeg',
  },
  openGraph: {
    title: 'BP Black Panthers',
    description: 'Official clan hub for ẞP.ঐ [ BLACK PANTHERS ] CODM Esports.',
    type: 'website',
    locale: 'en_US',
    siteName: 'BP Black Panthers',
    images: [
      {
        url: '/logo/BP-BlackPanthers.jpeg',
        width: 800,
        height: 800,
        alt: 'BP Black Panthers Logo',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-panther-dark`}>
        {children}
      </body>
    </html>
  );
}

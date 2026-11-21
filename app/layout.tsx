import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Club Expense Tracker — Sistem Penjejak Bajet & Perbelanjaan Kelab',
  description:
    'Sistem pengurusan kewangan kelab pelajar untuk merekod pendapatan, perbelanjaan, dan memantau baki semasa dalam masa nyata.',
  openGraph: {
    title: 'Club Expense Tracker — Sistem Penjejak Bajet & Perbelanjaan Kelab',
    description:
      'Sistem pengurusan kewangan kelab pelajar untuk merekod pendapatan, perbelanjaan, dan memantau baki semasa dalam masa nyata.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Club Expense Tracker — Sistem Penjejak Bajet & Perbelanjaan Kelab',
    description:
      'Sistem pengurusan kewangan kelab pelajar untuk merekod pendapatan, perbelanjaan, dan memantau baki semasa dalam masa nyata.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ms"
      className={`${plusJakarta.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-slate-900 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

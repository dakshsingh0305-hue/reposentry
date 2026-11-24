import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'RepoSentry | Open Source Security Intelligence Platform',
  description: 'Scan GitHub repositories for dependency vulnerabilities using OSV.dev API. Real-time security analysis for npm, Python, and more.',
  keywords: ['security', 'vulnerability', 'dependencies', 'github', 'npm', 'python', 'osv'],
  authors: [{ name: 'RepoSentry' }],
  creator: 'RepoSentry',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-reposentry-bg text-reposentry-text min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

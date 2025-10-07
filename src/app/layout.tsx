import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SorrisinhoCall - Chamadas Exclusivas',
  description: 'Plataforma de chamadas exclusivas e momentos únicos com Sorrisinho',
  keywords: 'chamadas, vídeos, exclusivo, premium, sorrisinho',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
import type { Metadata } from 'next';
import './globals.css';
import { ClientWrapper } from '@/lib/client-wrapper';

export const metadata: Metadata = {
  title: 'PixelFlow AI | Otimizador Profissional de Metadados e Aparência Visual',
  description: 'Refine suas fotos de IA de forma profissional para redes sociais. Purificação de metadados binários EXIF/XMP, adição de grão cinematográfico analógico, otimização social e compressão inteligente.',
  keywords: ['remover metadados', 'remover exif', 'metadata remover', 'remover dados da foto', 'image metadata remover', 'limpar metadados imagem'],
  authors: [{ name: 'PixelFlow' }],
  openGraph: {
    title: 'PixelFlow AI | Otimizador Profissional de Metadados e Aparência Visual',
    description: 'Refine suas fotos de IA de forma profissional para redes sociais. Purificação de metadados binários EXIF/XMP, adição de grão cinematográfico analógico e compressão inteligente.',
    url: 'https://pixelflow.ai',
    siteName: 'PixelFlow AI',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className="min-h-screen bg-[#020617] text-slate-50 antialiased selection:bg-amber-500/20 selection:text-amber-300">
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}


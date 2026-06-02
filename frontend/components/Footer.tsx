'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950/90 py-12 px-6 relative z-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          
          {/* Column 1: Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="font-bold text-white text-sm font-display tracking-tight">PixelFlow AI</span>
            </div>
            <p className="text-slate-500 leading-relaxed mb-4 text-[11px]">
              Otimização visual avançada e refinamento de metadados binários para criadores de altíssimo nível digital.
            </p>
            <span className="text-[10px] text-slate-600 font-mono">© 2026 PixelFlow. Todos os direitos reservados.</span>
          </div>

          {/* Column 2: Otimizadores Técnicos */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] mb-4 text-amber-400">Ferramentas de Purificação</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/remover-metadados" className="text-slate-400 hover:text-white uppercase text-[10px] font-semibold transition-colors block">
                  Remover Metadados
                </Link>
              </li>
              <li>
                <Link href="/remover-exif" className="text-slate-400 hover:text-white uppercase text-[10px] font-semibold transition-colors block">
                  Remover EXIF
                </Link>
              </li>
              <li>
                <Link href="/metadata-remover" className="text-slate-400 hover:text-white uppercase text-[10px] font-semibold transition-colors block">
                  Metadata Remover
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Métodos de Higienização */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] mb-4 text-amber-400">Métodos e Guias</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/remover-dados-da-foto" className="text-slate-400 hover:text-white uppercase text-[10px] font-semibold transition-colors block">
                  Remover Dados da Foto
                </Link>
              </li>
              <li>
                <Link href="/image-metadata-remover" className="text-slate-400 hover:text-white uppercase text-[10px] font-semibold transition-colors block">
                  Image Metadata Remover
                </Link>
              </li>
              <li>
                <Link href="/limpar-metadados-imagem" className="text-slate-400 hover:text-white uppercase text-[10px] font-semibold transition-colors block">
                  Limpar Metadados Imagem
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Central SEO Blog Resources */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px] mb-4 text-amber-400">Recursos de SEO</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-white uppercase text-[10px] font-semibold transition-colors block">
                  Nosso Blog Oficial
                </Link>
              </li>
              <li>
                <Link href="/blog/como-remover-metadados-de-imagens" className="text-slate-400 hover:text-white uppercase text-[10px] font-semibold transition-colors block">
                  Guia de Metadados
                </Link>
              </li>
              <li>
                <Link href="/blog/instagram-detecta-imagens-ia" className="text-slate-400 hover:text-white uppercase text-[10px] font-semibold transition-colors block">
                  Selo de IA no Instagram
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogClient from '@/components/BlogClient';
import { BLOG_ARTICLES } from '@/src/blogData';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog PixelFlow AI | Dicas de SEO, EXIF e Imagens de Alta Resolução',
  description: 'Aprenda truques avançados sobre remoção de metadados, EXIF de fotos, preservação de resolução, naturalização visual com grãos finos e otimização para Instagram.',
  alternates: {
    canonical: 'https://pixelflow.ai/blog',
  },
  openGraph: {
    title: 'Blog PixelFlow AI | Otimização e Metadados',
    description: 'Guia de SEO definitivo, conformidade LGPD e filtros estéticos para fotos digitais.',
    url: 'https://pixelflow.ai/blog',
    type: 'website',
  }
};

export default function BlogIndex() {
  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-50">
      <Header />
      <main className="flex-grow">
        <BlogClient articles={BLOG_ARTICLES} />
      </main>
      <Footer />
    </div>
  );
}

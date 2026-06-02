import React from 'react';
import { notFound } from 'next/navigation';
import { BLOG_ARTICLES, BlogArticle } from '@/src/blogData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, Clock, List, Check, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = BLOG_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: 'Artigo Não Encontrado | PixelFlow AI',
    };
  }

  return {
    title: `${article.title} | Blog PixelFlow AI`,
    description: article.description,
    alternates: {
      canonical: `https://pixelflow.ai/blog/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://pixelflow.ai/blog/${slug}`,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
    },
  };
}

// Render Table of Contents elements from article content dynamically
function getTableOfContents(content: string) {
  const lines = content.split('\n');
  const headers: { id: string; text: string }[] = [];
  lines.forEach((line) => {
    if (line.startsWith('### ')) {
      const text = line.replace('### ', '').trim();
      const id = text.toLowerCase()
        .replace(/[áàâãä]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i')
        .replace(/[óòôõö]/g, 'o')
        .replace(/[úùûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, '-');
      headers.push({ id, text });
    }
  });
  return headers;
}

// Convert raw markdown segments to formatted React components with target ids linked
function renderMarkdownContent(content: string) {
  const lines = content.split('\n');
  return lines.map((line, idx) => {
    const cleanLine = line.trim();
    if (!cleanLine) return <div key={idx} className="h-4" />;

    if (cleanLine.startsWith('### ')) {
      const text = cleanLine.replace('### ', '');
      const id = text.toLowerCase()
        .replace(/[áàâãä]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i')
        .replace(/[óòôõö]/g, 'o')
        .replace(/[úùûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, '-');
      return (
        <h3 
          key={idx} 
          id={id} 
          className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-8 mb-4 font-display scroll-mt-20 border-l-2 border-amber-400 pl-3"
        >
          {text}
        </h3>
      );
    }

    if (cleanLine.startsWith('* ')) {
      return (
        <li key={idx} className="text-xs sm:text-sm text-slate-300 ml-6 list-disc mb-2 leading-relaxed">
          {cleanLine.replace('* ', '')}
        </li>
      );
    }

    if (cleanLine.match(/^\d+\./)) {
      return (
        <li key={idx} className="text-xs sm:text-sm text-slate-300 ml-6 list-decimal mb-2 leading-relaxed">
          {line.replace(/^\d+\.\s*/, '')}
        </li>
      );
    }

    return (
      <p key={idx} className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
        {cleanLine}
      </p>
    );
  });
}

function getRelatedArticles(article: BlogArticle) {
  return BLOG_ARTICLES.filter(
    (a) =>
      a.slug !== article.slug &&
      (a.category === article.category ||
        article.relatedParagraphs.some((p) => a.title.includes(p)))
  ).slice(0, 2);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = BLOG_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const tocHeaders = getTableOfContents(article.contentMarkdown);
  const related = getRelatedArticles(article);

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-50">
      <Header />
      
      <main className="flex-grow select-text">
        <div className="mx-auto max-w-6xl px-6 pt-10 pb-20 relative z-10">
          
          {/* Top Back Link bar */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-5 mb-10 text-xs font-mono text-slate-500">
            <Link 
              href="/blog"
              className="hover:text-white transition-colors flex items-center gap-1.5 font-bold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>VOLTAR PARA O BLOG</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/" className="hover:text-white transition-colors">INÍCIO</Link>
              <span>/</span>
              <span className="text-amber-400 font-bold uppercase">{article.category}</span>
            </div>
          </div>

          {/* Article Heading */}
          <div className="max-w-4xl mx-auto mb-10 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-400/5 border border-amber-400/10 text-[9px] font-black uppercase tracking-widest text-amber-400 mb-4 font-mono">
              {article.category}
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight mb-6 font-display">
              {article.title}
            </h1>

            {/* Author and stats block */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-3 gap-x-6 text-xs text-slate-500 font-semibold uppercase tracking-wider font-mono">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-amber-400" />
                <span>Por {article.author}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-600" />
                <span>{article.date}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-600" />
                <span>{article.readTime} de leitura</span>
              </span>
            </div>
          </div>

          {/* Layout split with TOC Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
            
            {/* Table of Contents Sidebar */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 bg-slate-900/10 border border-slate-900 rounded-2xl p-5 hidden lg:block text-left">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
                <List className="h-4 w-4 text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white font-mono">Índice do Artigo</span>
              </div>
              <ul className="space-y-3">
                {tocHeaders.map((item, id) => (
                  <li key={id}>
                    <a 
                      href={`#${item.id}`}
                      className="text-slate-400 hover:text-amber-400 text-[11px] font-bold uppercase transition-colors block line-clamp-1 py-0.5"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Markdown rendered body */}
            <div className="lg:col-span-8 bg-[#0d1021]/30 border border-slate-900/60 p-6 sm:p-8 rounded-2xl text-left">
              {renderMarkdownContent(article.contentMarkdown)}
            </div>

          </div>

          {/* Related grid */}
          <div className="max-w-5xl mx-auto mt-16 pt-10 border-t border-slate-900 text-left">
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 font-display">Artigos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {related.map((post, index) => (
                <Link 
                  key={index} 
                  href={`/blog/${post.slug}`}
                  className="p-5 rounded-2xl border border-slate-900 bg-slate-900/10 hover:border-amber-400/20 cursor-pointer transition-all duration-200 flex flex-col justify-between group text-left"
                >
                  <div>
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest font-mono block mb-2">{post.category}</span>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-wide mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{post.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    <span>{post.readTime}</span>
                    <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1 text-amber-400">
                      <span>CRAWL</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Registration CTA card */}
          <div className="max-w-5xl mx-auto rounded-3xl bg-slate-900/40 border border-slate-850 p-8 text-center mt-16 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[#0c1226]/80" />
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block mb-2 font-mono">Experimente Sem Compromissos</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter mb-4 font-display">Higienize seus criativos em segundos</h2>
              <p className="text-xs text-slate-400 max-w-xl mx-auto mb-6 leading-relaxed">
                Nossa consola limpa todos os EXIF/XMP binários preservando a nitidez sem carregar fotos em servidores terceiros. Proteja sua privacidade agora.
              </p>
              <Link 
                href="/app"
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 text-black px-6 py-3 font-black uppercase tracking-widest text-[10px] hover:bg-amber-300 transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)]"
              >
                <span>Acessar Painel Grátis</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

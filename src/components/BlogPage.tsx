import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, User, Clock, Tag, ArrowRight, ArrowLeft, Search, List, Menu } from 'lucide-react';
import { BLOG_ARTICLES, BlogArticle } from '../blogData';
import SEOHead from './SEOHead';

interface BlogPageProps {
  currentArticleSlug: string | null;
  onSelectArticle: (slug: string | null) => void;
  onNavigateHome: () => void;
  onNavigateToAuth: () => void;
}

export default function BlogPage({ currentArticleSlug, onSelectArticle, onNavigateHome, onNavigateToAuth }: BlogPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentArticleSlug]);

  const categories = ['all', 'SEO', 'Instagram', 'Inteligência Artificial', 'Imagens', 'Metadados'];

  // Filter blog posts
  const filteredArticles = BLOG_ARTICLES.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Load single article
  const currentArticle = currentArticleSlug 
    ? BLOG_ARTICLES.find(a => a.slug === currentArticleSlug) 
    : null;

  // Render Table of Contents elements from article content dynamically
  const getTableOfContents = (content: string) => {
    const lines = content.split('\n');
    const headers: { id: string; text: string }[] = [];
    lines.forEach((line) => {
      if (line.startsWith('### ')) {
        const text = line.replace('### ', '').trim();
        // Convert header title to slug-friendly hash id
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
  };

  // Convert raw markdown segments to formatted React components with target ids linked
  const renderMarkdownContent = (content: string) => {
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
  };

  // Find related articles
  const getRelatedArticles = (article: BlogArticle) => {
    return BLOG_ARTICLES.filter(a => a.slug !== article.slug && (a.category === article.category || article.relatedParagraphs.some(p => a.title.includes(p)))).slice(0, 2);
  };

  // Standard Canonical reference
  const canonicalUrl = currentArticle 
    ? `https://pixelflow-ai.com/blog/${currentArticle.slug}`
    : 'https://pixelflow-ai.com/blog';

  // Article JSON-LD Schema
  const articleSchema = currentArticle ? {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': currentArticle.title,
    'description': currentArticle.description,
    'datePublished': currentArticle.date,
    'author': {
      '@type': 'Person',
      'name': currentArticle.author
    }
  } : null;

  return (
    <div className="bg-[#020617] text-slate-100 min-h-screen relative pb-20 select-text">
      
      {/* Background radial atmosphere */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-600/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Dynamic SEO Injector */}
      <SEOHead
        title={currentArticle ? `${currentArticle.title} | Blog PixelFlow AI` : 'Blog PixelFlow AI - Dicas de SEO, EXIF e Imagens'}
        description={currentArticle ? currentArticle.description : 'Aprenda truques avançados sobre remoção de metadados, EXIF de fotos, desviar de punição algorítmica de IA e otimizar imagens para o Instagram.'}
        canonicalUrl={canonicalUrl}
        schemaType={currentArticle ? 'Article' : undefined}
        schemaData={articleSchema}
      />

      <div className="mx-auto max-w-6xl px-6 pt-8 relative z-10">
        
        {/* Render Single Article view */}
        {currentArticle ? (
          <div>
            {/* Top link bar */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-5 mb-10 text-xs font-mono text-slate-500">
              <button 
                onClick={() => onSelectArticle(null)}
                className="hover:text-white transition-colors flex items-center gap-1.5 font-bold"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>VOLTAR PARA O BLOG</span>
              </button>
              <div className="flex items-center gap-2">
                <button onClick={onNavigateHome} className="hover:text-white transition-colors">INÍCIO</button>
                <span>/</span>
                <span className="text-amber-400 font-bold uppercase">{currentArticle.category}</span>
              </div>
            </div>

            {/* Article Heading */}
            <div className="max-w-4xl mx-auto mb-10 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-400/5 border border-amber-400/10 text-[9px] font-black uppercase tracking-widest text-amber-400 mb-4 font-mono">
                {currentArticle.category}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-6 font-display">
                {currentArticle.title}
              </h1>

              {/* Author and stats block */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-3 gap-x-6 text-xs text-slate-500 font-semibold uppercase tracking-wider font-mono">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-amber-400" />
                  <span>Por {currentArticle.author}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-600" />
                  <span>{currentArticle.date}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-600" />
                  <span>{currentArticle.readTime} de leitura</span>
                </span>
              </div>
            </div>

            {/* Content Structure Layout (Grid containing dynamic Table of Contents sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
              
              {/* Dynamic Automated Table of Contents sidebar */}
              <div className="lg:col-span-4 lg:sticky lg:top-24 bg-slate-900/10 border border-slate-900 rounded-2xl p-5 hidden lg:block">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
                  <List className="h-4 w-4 text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white font-mono">Índice do Artigo</span>
                </div>
                <ul className="space-y-3">
                  {getTableOfContents(currentArticle.contentMarkdown).map((item, id) => (
                    <li key={id}>
                      <a 
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-slate-400 hover:text-amber-400 text-[11px] font-bold uppercase transition-colors block line-clamp-1 py-0.5"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Parsed and Formatted Article Body */}
              <div className="lg:col-span-8 prose prose-invert bg-[#0d1021]/30 border border-slate-900/60 p-6 sm:p-8 rounded-2xl">
                {renderMarkdownContent(currentArticle.contentMarkdown)}
              </div>

            </div>

            {/* Related Articles block and smart internal links */}
            <div className="max-w-5xl mx-auto mt-16 pt-10 border-t border-slate-900">
              <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 font-display">Artigos Relacionados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {getRelatedArticles(currentArticle).map((post, index) => (
                  <div 
                    key={index}
                    onClick={() => onSelectArticle(post.slug)}
                    className="p-5 rounded-2xl border border-slate-900 bg-slate-900/10 hover:border-amber-400/20 cursor-pointer transition-all duration-200 flex flex-col justify-between group"
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
                        <span>Ligar</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Registration CTA card */}
            <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-slate-950 to-[#0c1226] border border-slate-900 p-8 text-center mt-16 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.02),transparent_70%)] pointer-events-none" />
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block mb-2 font-mono">Experimente Sem Compromisso</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter mb-4 font-display">Higienize seus arquivos IA automaticamente</h2>
              <p className="text-xs text-slate-400 max-w-xl mx-auto mb-6 leading-relaxed">
                Nossa consola limpa todos os EXIF/XMP binários preservando a nitidez sem carregar fotos em servidores terceiros. Proteja sua privacidade agora.
              </p>
              <button 
                onClick={onNavigateToAuth}
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 text-black px-6 py-3 font-black uppercase tracking-widest text-[10px] hover:bg-amber-300 transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)]"
              >
                <span>Acessar Painel Grátis</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        ) : (
          /* Render Article listing Page */
          <div>
            {/* Header section of blog index */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-black tracking-widest text-amber-400 mb-4 uppercase">
                Biblioteca de Conhecimento
              </span>
              <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-4 font-display">
                GUIA DE SEO INFALÍVEL & METADADOS
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
                Confira truques de engenharia reversa do Instagram, privacidade de geolocalização e as melhores práticas para carregar portfólios velozes livres de rastreamento.
              </p>
            </div>

            {/* Filter toolbar (search + categories) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-10 border-y border-slate-900 py-6">
              
              {/* Category selector capsules */}
              <div className="md:col-span-8 flex flex-wrap gap-2">
                {categories.map((cat, id) => (
                  <button
                    key={id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-amber-400 text-slate-950 shadow' : 'border border-slate-800 hover:border-slate-700 hover:bg-slate-900/30 text-slate-400'}`}
                  >
                    {cat === 'all' ? 'Ver Todos' : cat}
                  </button>
                ))}
              </div>

              {/* Reactive search query bar */}
              <div className="md:col-span-4 relative">
                <input 
                  type="text"
                  placeholder="Pesquisar artigos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-slate-950 hover:bg-slate-900/30 border border-slate-800 rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:border-amber-400 text-white placeholder-slate-600 transition-colors"
                />
                <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-600" />
              </div>

            </div>

            {/* Listing grid cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout text-left">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article, idx) => (
                    <motion.div
                      key={article.slug}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      onClick={() => onSelectArticle(article.slug)}
                      className="rounded-2xl border border-slate-900 bg-slate-900/10 hover:border-amber-400/20 hover:bg-slate-900/25 p-5 cursor-pointer flex flex-col justify-between group transition-all duration-250 relative overflow-hidden"
                    >
                      <div>
                        {/* Article Category indicator pill */}
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest font-mono">
                            {article.category}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 font-semibold">{article.readTime}</span>
                        </div>

                        <h3 className="text-sm font-black text-white uppercase tracking-wide group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug mb-2 font-display">
                          {article.title}
                        </h3>

                        <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed mb-4">
                          {article.description}
                        </p>
                      </div>

                      {/* Author credentials footer */}
                      <div className="border-t border-slate-900/80 pt-4 flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-600" />
                          <span className="truncate max-w-[120px]">{article.author}</span>
                        </span>
                        <span className="group-hover:translate-x-1.5 transition-transform flex items-center gap-1 text-amber-400 font-bold">
                          <span>LEITURA</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-slate-500 text-xs font-mono uppercase tracking-widest bg-slate-950/20 border border-dashed border-slate-900 rounded-2xl">
                    Nenhum artigo encontrado. Tente outros termos.
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

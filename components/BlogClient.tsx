'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, ArrowRight } from 'lucide-react';
import { BlogArticle } from '@/src/blogData';
import Link from 'next/link';

interface BlogClientProps {
  articles: BlogArticle[];
}

export default function BlogClient({ articles }: BlogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['all', 'SEO', 'Instagram', 'Inteligência Artificial', 'Imagens', 'Metadados'];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-6xl px-6 pt-12 pb-20 relative z-10 text-left">
      
      {/* Blog header index */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-900 text-[10px] font-black tracking-widest text-amber-400 mb-4 uppercase">
          Biblioteca de Conhecimento
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-4 font-display">
          GUIA DE SEO INFALÍVEL & METADADOS
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
          Confira truques de naturalização com grão analógico, privacidade de geolocalização e as melhores práticas para carregar portfólios velozes livres de rastreamento.
        </p>
      </div>

      {/* Filter toolbar (search + categories) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-10 border-y border-slate-900 py-6">
        
        {/* Category capsules */}
        <div className="md:col-span-8 flex flex-wrap gap-2">
          {categories.map((cat, id) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-amber-400 text-slate-950 shadow' 
                  : 'border border-slate-800 hover:border-slate-705 hover:bg-slate-900/30 text-slate-400'
              }`}
            >
              {cat === 'all' ? 'Ver Todos' : cat}
            </button>
          ))}
        </div>

        {/* Search query bar */}
        <div className="md:col-span-4 relative">
          <input 
            type="text"
            placeholder="Pesquisar artigos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-950 hover:bg-slate-900/30 border border-slate-800 rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:border-amber-400 text-white placeholder-slate-700 transition-colors"
          />
          <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-600" />
        </div>

      </div>

      {/* Listing grid cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article, idx) => (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="rounded-2xl border border-slate-900 bg-slate-900/10 hover:border-amber-400/20 hover:bg-slate-900/25 p-5 flex flex-col justify-between group transition-all duration-250 relative overflow-hidden"
              >
                <Link href={`/blog/${article.slug}`} className="absolute inset-0 z-10" />
                <div>
                  {/* Category and read stats */}
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
                    <span>CRAWL</span>
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
  );
}

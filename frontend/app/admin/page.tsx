'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminDashboard from '@/src/components/AdminDashboard';
import { useAuth } from '@/lib/auth-context';
import { RefreshCw, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#020617] text-slate-50 justify-center items-center">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
        <span className="text-xs font-mono tracking-widest uppercase text-slate-500 mt-4 animate-pulse">Autenticando Consola...</span>
      </div>
    );
  }

  const isAdmin = profile && profile.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-50">
      <Header />
      
      <main className="flex-grow">
        {isAdmin ? (
          <AdminDashboard />
        ) : (
          <div className="max-w-md mx-auto px-6 py-28 text-center">
            <XCircle className="mx-auto h-14 w-14 text-red-500 mb-6 animate-pulse" />
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white font-display">Acesso Negado</h1>
            <p className="mt-3 text-xs leading-relaxed text-slate-400 font-medium mb-8">
              Esta área é restrita exclusivamente para contas de faturamento e administração operacional do PixelFlow AI.
            </p>
            <Link 
              href="/"
              className="inline-flex rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-6 py-2.5 text-xs font-black uppercase tracking-widest"
            >
              Voltar ao Início
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DashboardClient from '@/components/DashboardClient';
import { useAuth } from '@/lib/auth-context';
import { ShieldAlert, LogIn, Sparkles, RefreshCw } from 'lucide-react';

export default function AppPage() {
  const { profile, loading, setAuthOpen, loginGoogle, refreshProfile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#020617] text-slate-50 justify-center items-center">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
        <span className="text-xs font-mono tracking-widest uppercase text-slate-500 mt-4 animate-pulse">Sincronizando Consola...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-50">
      <Header />
      
      <main className="flex-grow">
        {profile ? (
          <DashboardClient 
            userProfile={profile} 
            onRefreshProfile={refreshProfile} 
            onOpenPlanSelector={() => {
              // Direct navigation to pricing plans
              const pricingSection = document.getElementById('pricing');
              if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.location.href = '/#pricing';
              }
            }}
          />
        ) : (
          <div className="max-w-md mx-auto px-6 py-24 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
            </div>
            
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white font-display">
              Acesso Restrito
            </h1>
            <p className="mt-3 text-xs leading-relaxed text-slate-400 font-medium mb-8">
              Faça login de forma 100% segura com seu e-mail do Google para desbloquear a plataforma de refinamento visual e processar até 5 imagens no plano free immediately.
            </p>

            <button
              onClick={loginGoogle}
              className="w-full flex items-center justify-center gap-3 rounded-full bg-amber-400 hover:bg-amber-300 p-4 text-xs font-black uppercase tracking-widest text-[#020617] transition-all duration-200 shadow-[0_0_25px_rgba(251,191,36,0.25)] cursor-pointer"
            >
              <LogIn className="h-5 w-5" />
              <span>Entrar com o Google</span>
            </button>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4 text-amber-500/55" />
              <span>Autenticação garantida via Google Firebase.</span>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

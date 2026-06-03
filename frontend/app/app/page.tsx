'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DashboardClient from '@/components/DashboardClient';
import { useAuth } from '@/lib/auth-context';
import { ShieldAlert, LogIn, Sparkles, RefreshCw, X, CreditCard, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getApiUrl } from '@/lib/api-client';

export default function AppPage() {
  const { profile, loading, loginGoogle, refreshProfile, showCheckout, setShowCheckout } = useAuth();
  const [isCheckoutPaying, setIsCheckoutPaying] = useState(false);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !showCheckout.tier) return;

    setIsCheckoutPaying(true);
    
    try {
      const response = await fetch(getApiUrl('/api/mercadopago/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.uid,
          email: profile.email,
          tier: showCheckout.tier
        })
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Falha ao processar assinatura.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao se conectar ao faturamento do Mercado Pago.');
    } finally {
      setIsCheckoutPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#020617] text-slate-50 justify-center items-center">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
        <span className="text-xs font-mono tracking-widest uppercase text-slate-500 mt-4 animate-pulse font-bold">Sincronizando Consola...</span>
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
              setShowCheckout({ active: true, tier: 'pro' });
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

      {/* Mercado Pago Checkout Overlay */}
      <AnimatePresence>
        {showCheckout.active && showCheckout.tier && profile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckout({ active: false, tier: null })}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/10 bg-[#0d1024] p-8 shadow-2xl z-10 text-left"
            >
              <button
                onClick={() => setShowCheckout({ active: false, tier: null })}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">Mercado Pago Checkout</span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 font-display">
                Ativar Plano <span className="text-amber-400 capitalize">{showCheckout.tier}</span>
              </h3>
              <p className="text-xs text-slate-400 leading-normal mb-6">
                Você será redirecionado de forma segura para o faturamento oficial do Mercado Pago para ativar a sua assinatura.
              </p>

              {/* Order summary */}
              <div className="bg-slate-950 p-4 rounded-2xl mb-6 border border-slate-900 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-white capitalize block mb-0.5">PixelFlow {showCheckout.tier === 'pro' ? 'Profissional' : 'Corporativo'} (Mensal)</span>
                  <span className="text-slate-500 block">Processamento de imagem ilimitado e imediato</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-amber-400 font-mono">
                    {showCheckout.tier === 'pro' ? 'R$ 29 /mês' : 'R$ 79 /mês'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs font-mono">
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isCheckoutPaying}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00b1ea] to-[#009ee3] hover:from-[#009ee3] hover:to-[#008fcc] py-4 text-xs tracking-widest uppercase font-mono font-bold text-white transition-all shadow-[0_0_20px_rgba(0,158,227,0.15)] cursor-pointer"
                  >
                    {isCheckoutPaying ? (
                      <span>Redirecionando...</span>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 animate-pulse" />
                        <span>Ir para o Mercado Pago</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

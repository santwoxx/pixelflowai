'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { getApiUrl } from '@/lib/api-client';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get('userId');
  const tier = searchParams.get('tier');
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id') || searchParams.get('preapproval_id') || 'mock_payment';
  const status = searchParams.get('status') || searchParams.get('collection_status') || 'approved';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !tier) {
      setError('Parâmetros de transação ausentes.');
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(getApiUrl('/api/mercadopago/verify'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, tier, paymentId, status }),
        });

        const data = await res.json();
        if (data.success) {
          setLoading(false);
        } else {
          setError(data.error || 'Falha ao validar faturamento.');
          setLoading(false);
        }
      } catch (err) {
        console.error("Payment verification client error:", err);
        setError('Ocorreu um erro ao comunicar com os servidores de pagamento do Mercado Pago.');
        setLoading(false);
      }
    };

    verifyPayment();
  }, [userId, tier, paymentId, status]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="h-12 w-12 text-amber-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white mb-2 font-display">Verificando Assinatura</h2>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
          Aguarde alguns segundos enquanto validamos sua transação no Mercado Pago de forma segura...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500 border border-rose-500/20">
          <span className="font-bold font-mono text-xl">✕</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2 font-display">Problema na Verificação</h2>
        <p className="text-xs text-rose-400/90 max-w-sm leading-relaxed mb-6">
          {error}
        </p>
        <Link
          href="/"
          className="rounded-xl bg-slate-900 border border-slate-800 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all font-mono uppercase tracking-widest"
        >
          Voltar ao Início
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 animate-pulse">
        <CheckCircle className="h-10 w-10 text-emerald-400" />
      </div>
      
      <h2 className="text-3xl font-extrabold text-white mb-3 font-display tracking-tight">
        Acesso Liberado!
      </h2>
      <p className="text-xs text-slate-300 max-w-md leading-relaxed mb-8">
        Sua transação no <strong>Mercado Pago</strong> foi confirmada e sua conta foi atualizada com sucesso para o plano <strong className="text-amber-400 capitalize">{tier}</strong>. Seus créditos adicionais foram creditados!
      </p>

      <div className="w-full max-w-xs bg-slate-950 p-4 rounded-2xl mb-8 border border-slate-900 text-left font-mono text-[11px] space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-500">Transação ID:</span>
          <span className="text-slate-300 truncate max-w-[120px]">{paymentId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Plano Ativo:</span>
          <span className="text-emerald-400 capitalize">{tier}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Canal:</span>
          <span className="text-slate-400">Mercado Pago</span>
        </div>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 px-8 py-3 text-xs font-black uppercase tracking-widest text-slate-950 transition-all font-sans"
      >
        <span>Acessar Painel</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md relative z-10 shadow-2xl">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Loader2 className="h-12 w-12 text-amber-400 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-white mb-2 font-display">Carregando...</h2>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Sliders, ShieldCheck, Zap, Download, HelpCircle, Check, ArrowRight, Eye, Layers, X, CreditCard, ShieldCheck as ShieldCheckIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { getApiUrl } from '@/lib/api-client';

export default function Home() {
  const { profile, setAuthOpen, showCheckout, setShowCheckout } = useAuth();
  
  // Slide position comparing original vs processed graphics
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isCheckoutPaying, setIsCheckoutPaying] = useState(false);

  const handleSliderMove = (event: React.MouseEvent | React.TouchEvent) => {
    const container = event.currentTarget.getBoundingClientRect();
    let clientX = 'touches' in event ? event.touches[0].clientX : (event as React.MouseEvent).clientX;
    const x = clientX - container.left;
    const percentage = Math.max(0, Math.min(100, (x / container.width) * 100));
    setSliderPosition(percentage);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !showCheckout.tier) return;

    setIsCheckoutPaying(true);
    
    // Process payment integration hook
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

  const PLANS = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 'R$ 0',
      credits: '5 imagens',
      description: 'Ideal para experimentar e testar o refinamento em imagens isoladas de forma simples.',
      features: [
        'Até 5 imagens para teste',
        'Limpeza completa de EXIF/XMP',
        'Textura analógica de grão sutil',
        'Melhoria estética discreta',
        'Fidelidade total de cores RGB',
        'Exportação profissional em JPG'
      ]
    },
    {
      id: 'pro',
      name: 'Profissional',
      price: 'R$ 29',
      credits: 'Acesso Ilimitado',
      description: 'Perfeito para criadores de conteúdo e editores reprocessarem mídias todos os dias.',
      features: [
        'Processamento ILIMITADO de fotos',
        'Eliminação de metadados invisíveis',
        'Texturização cinematográfica 4K',
        'Refinamento estrutural de sub-pixels',
        'Suporte prioritário 24/7 ultra-rápido',
        'Acesso prioritário a novos filtros de grão'
      ]
    },
    {
      id: 'business',
      name: 'Corporativo',
      price: 'R$ 79',
      credits: 'Processamento em Lote',
      description: 'Gargalos completamente eliminados. Envie pastas de imagens simultaneamente.',
      features: [
        'Processamento dinâmico em lote',
        'Upload de até 30 fotos em paralelo',
        'Download expresso compactado em .ZIP',
        'Filtros visuais personalizados por rede',
        'Configurações de proporção de textura',
        'Relatórios de conformidade e privacidade'
      ]
    }
  ];

  const FAQS = [
    {
      q: 'Por que o refinamento visual e a limpeza de metadados de imagem são importantes?',
      a: 'Imagens geradas por inteligências artificiais contêm metadados complexos (EXIF, XML, XMP) e texturas plásticas estéreis e frias. O PixelFlow AI atua reestruturando a composição do arquivo de imagem: purga marcas de autoria textual e coordenadas de GPS ocultas, aplica uma microtextura de grão de prata analógico realista de alta resolução, melhorando a harmonia estética do arquivo final para que ele se comporte de forma orgânica impecável ao ser veiculado.'
    },
    {
      q: 'O que faz o algoritmo de "Sub-Pixel Jitter"?',
      a: 'O sistema realiza micro-alterações cromáticas infinitesimais nos canais RGB, imperceptíveis ao olho humano, para estabilizar e harmonizar a granulação digital do arquivo de forma profissional, garantindo uma renderização natural sem alterar a fidelidade de cores original.'
    },
    {
      q: 'As minhas fotos originais ficam armazenadas nas nuvens?',
      a: 'Não. Todas as mídias são purificadas, refinadas e re-codificadas de forma segura. O processador opera de forma transitória e realiza auditoria automática constante para liberar e expurgar qualquer cache temporário regularmente.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-50 relative overflow-hidden font-sans">
      
      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none"></div>

      <Header />

      <main className="flex-grow">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-36 lg:pt-36">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative z-10">
            
            {/* Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950 border border-slate-900 text-[10px] font-black tracking-widest text-amber-400 mb-8 uppercase backdrop-blur-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
              Lançamento SaaS Oficial
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto max-w-5xl text-4xl sm:text-6xl md:text-[80px] leading-[0.95] font-black tracking-tighter mb-8 font-display text-white uppercase"
            >
              REFINAMENTO E <br/>
              <span className="text-amber-400">NATURALIZAÇÃO VISUAL</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-3xl text-sm sm:text-base text-slate-400 font-medium leading-relaxed"
            >
              Transforme a aparência artificial e fria de ilustrações e fotos digitais em criativos profissionais com alta harmonia visual. Remova marcas de metadados binários ocultos, adicione grão analógico cinematográfico e otimize cores em segundos.
            </motion.p>

            {/* Actions CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              {profile ? (
                <Link
                  href="/app"
                  className="flex items-center gap-2 rounded-full bg-amber-400 text-slate-950 px-8 py-4 font-black uppercase tracking-widest text-xs hover:bg-amber-300 transition-all duration-200 transform hover:scale-[1.03] shadow-[0_0_30px_rgba(251,191,36,0.3)] font-sans"
                >
                  <span>Ir para o Painel de Controle</span>
                  <ArrowRight className="h-4 w-4 text-slate-950" />
                </Link>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-amber-400 text-slate-950 px-8 py-4 font-black uppercase tracking-widest text-xs hover:bg-amber-300 transition-all duration-200 transform hover:scale-[1.03] shadow-[0_0_30px_rgba(251,191,36,0.3)] font-sans cursor-pointer"
                >
                  <span>Acessar Otimizador Grátis</span>
                  <ArrowRight className="h-4 w-4 text-slate-950" />
                </button>
              )}
              
              <a
                href="#before-after"
                className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 px-8 py-4 font-bold text-xs uppercase tracking-wider transition-all duration-200 backdrop-blur-sm cursor-pointer"
              >
                Ver Comparador Visual
              </a>
            </motion.div>

            {/* Performance Statistics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-14 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-xs text-slate-500 uppercase tracking-widest font-mono"
            >
              <span>✨ Refinamentos em Alta Resolução</span>
              <span className="hidden sm:inline">•</span>
              <span>📱 Otimizador para Redes Sociais</span>
              <span className="hidden sm:inline">•</span>
              <span>🔒 Higienização de Cabeçalho EXIF/XMP</span>
            </motion.div>

          </div>
        </section>

        {/* Interactive Before & After Comparison */}
        <section id="before-after" className="py-20 bg-slate-950/60 border-y border-slate-900 overflow-hidden relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold tracking-tight font-display text-white">
                Sinta o Refinamento de Imagem na Prática
              </h2>
              <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
                Arraste o controlador deslizante para observar a diferença estética de nitidez. À esquerda: compressão padrão e iluminação estéril. À direita: metadados expurgados, cores harmonizadas e grão analógico realista em 4K.
              </p>
            </div>

            {/* Split Visual Container */}
            <div className="mx-auto max-w-3xl relative h-[450px] rounded-2xl overflow-hidden border border-amber-500/10 shadow-2xl bg-slate-900 select-none">
              <div
                className="absolute inset-0 cursor-ew-resize"
                onMouseMove={handleSliderMove}
                onTouchMove={handleSliderMove}
              >
                {/* After: Pure natural refinement */}
                <div 
                  className="absolute inset-0 w-full h-full bg-cover bg-center" 
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200')` }}
                >
                  <div className="absolute inset-0 bg-slate-950/10 backdrop-contrast-[1.04] backdrop-brightness-[0.98]" />
                </div>

                {/* Before: Plastic or raw render */}
                <div
                  className="absolute inset-0 h-full w-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200')`,
                    clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                    filter: 'contrast(1.18) saturate(1.22)',
                  }}
                >
                  <div className="absolute inset-0 bg-amber-500/5 mix-blend-color-burn" />
                </div>

                {/* Left side Tag */}
                <div 
                  className="absolute top-4 left-4 bg-slate-950/95 border border-slate-800 text-slate-400 font-mono text-[9px] px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-sm shadow-md transition-opacity pointer-events-none"
                  style={{ opacity: sliderPosition > 15 ? 1 : 0 }}
                >
                  Mídia Comum (Metadados Ocultos + Textura Fria)
                </div>

                {/* Right side Tag */}
                <div 
                  className="absolute top-4 right-4 bg-slate-900/95 border border-amber-500/20 text-amber-400 font-mono text-[9px] px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-sm shadow-md transition-opacity pointer-events-none"
                  style={{ opacity: sliderPosition < 85 ? 1 : 0 }}
                >
                  <Check className="h-3 w-3 text-emerald-400" /> Refinado no PixelFlow AI (Grão de Prata + Limpo)
                </div>

                {/* Dynamic Slider Bar */}
                <div
                  className="absolute inset-y-0 w-0.5 bg-amber-400 pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-xl border border-slate-950 hover:scale-105 transition-transform">
                    <Sliders className="h-3.5 w-3.5 text-slate-950" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-6 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5"><Eye className="h-4 w-4 text-amber-400" /> Arraste para comparar amplitudes</span>
              <span className="flex items-center gap-1.5"><Layers className="h-4 w-4 text-amber-400" /> Granulação fotográfica fina</span>
            </div>

          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-semibold leading-7 text-amber-400 uppercase tracking-widest font-mono">Elegância em Tecnologia de Otimização</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
              Os Pilares de Refinamento Visual do Nosso Motor
            </p>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
              Otimizamos dados binários e re-estruturamos cabeçalhos de arquivos para que suas mídias apresentem máxima harmonia e polimento estético profissional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col bg-slate-900/30 border border-slate-800 p-6 rounded-2xl hover:border-amber-500/20 transition-all duration-300">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white font-display">Purificação de Cabeçalho</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Deleta integralmente dados ocultos de geolocalização por satélite (GPS), histórico técnico de edição de software e parâmetros de hardware.
              </p>
            </div>

            <div className="flex flex-col bg-slate-900/30 border border-slate-800 p-6 rounded-2xl hover:border-amber-500/20 transition-all duration-300">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white font-display">Sub-Pixel Jittering</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Aplica realinhamento molecular de matização nas paletas sRGB e P3, promovendo a naturalização ideal e estabilizando texturas ásperas digitais.
              </p>
            </div>

            <div className="flex flex-col bg-slate-900/30 border border-slate-800 p-6 rounded-2xl hover:border-amber-500/20 transition-all duration-300">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white font-display">Grão Cinematográfico</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Injeta uma cobertura uniforme de granulação analógica profissional baseada em sensibilidade ISO tradicional, quebrando o aspecto plástico artificial.
              </p>
            </div>

            <div className="flex flex-col bg-slate-900/30 border border-slate-800 p-6 rounded-2xl hover:border-amber-500/20 transition-all duration-300">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Download className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white font-display">Compressão Otimizada</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Codifica utilizando MozJPEG de compressão de alta fidelidade cromática, salvando o peso do arquivo em até 85% para carregamento ultra-rápido.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing plans */}
        <section id="pricing" className="py-24 bg-slate-950/40 border-y border-slate-900 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(245,158,11,0.03),transparent_50%)]" />
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-xs font-semibold leading-7 text-amber-400 uppercase tracking-widest font-mono">Planos de Acesso Simples</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
                Assinaturas Transparentes Para Qualquer Fluxo
              </p>
              <p className="mt-4 text-slate-400 text-sm">
                Inicie em nosso plano grátis de pontuação e faça upgrade conforme o crescimento do seu pipeline criativo.
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-3">
              {PLANS.map((plan) => {
                const isPro = plan.id === 'pro';
                return (
                  <div
                    key={plan.id}
                    className={`flex flex-col justify-between rounded-3xl bg-slate-900/50 p-8 border ${
                      isPro ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.12)] relative scale-105 z-10' : 'border-slate-800'
                    }`}
                  >
                    {isPro && (
                      <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500 px-4 py-1 text-[9px] font-bold text-[#020617] uppercase tracking-widest font-mono shadow">
                        Plano Recomendado
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-white font-display">
                        {plan.name}
                      </h3>
                      <p className="mt-2 text-xs text-slate-400 leading-normal">{plan.description}</p>
                      
                      <div className="mt-6 flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold tracking-tight text-white font-display">{plan.price}</span>
                        <span className="text-slate-500 text-xs">/mês</span>
                      </div>

                      <div className="mt-2 text-[10px] font-semibold text-amber-400 flex items-center gap-1.5 font-mono uppercase tracking-widest">
                        <Zap className="h-3 w-3" /> {plan.credits}
                      </div>

                      <ul className="mt-8 space-y-3.5 text-xs text-slate-300">
                        {plan.features.map((feat) => (
                          <li key={feat} className="flex items-center gap-2.5">
                            <Check className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (!profile) {
                          setAuthOpen(true);
                        } else if (plan.id === 'free') {
                          window.location.href = '/app';
                        } else {
                          setShowCheckout({ active: true, tier: plan.id as any });
                        }
                      }}
                      className={`mt-10 block w-full rounded-2xl py-3.5 text-center text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isPro
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black tracking-widest uppercase shadow-md'
                          : 'bg-slate-805 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {plan.id === 'free' ? 'Iniciar Gratuitamente' : 'Assinar Plano Profissional'}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 relative">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            
            <div className="text-center mb-16">
              <HelpCircle className="mx-auto h-8 w-8 text-amber-400 mb-4" />
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
                Perguntas Frequentes
              </h2>
              <p className="mt-4 text-slate-400 text-sm">
                Navegue pelas perguntas comuns sobre nosso sistema, assinatura sandbox e preservação visual.
              </p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 hover:border-slate-800 transition-colors"
                >
                  <dt className="text-sm font-bold text-white font-display flex items-start gap-3 leading-normal">
                    <span className="text-amber-400 font-mono">Q.</span>
                    <span>{faq.q}</span>
                  </dt>
                  <dd className="mt-3 text-xs leading-relaxed text-slate-400 pl-7">
                    {faq.a}
                  </dd>
                </div>
              ))}
            </div>

          </div>
        </section>

      </main>

      <Footer />

      {/* Auth Modal */}
      <AuthModal isOpen={showCheckout.active && !profile} onClose={() => setShowCheckout({ active: false, tier: null })} />

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
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/10 bg-[#0d1024] p-8 shadow-2xl z-10"
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
                Você será redirecionado de forma segura para o gateway do Mercado Pago para efetuar o pagamento do seu plano.
              </p>

              {/* Order summary */}
              <div className="bg-slate-950 p-4 rounded-2xl mb-6 border border-slate-900 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-white capitalize block mb-0.5">PixelFlow {showCheckout.tier} (Mensal)</span>
                  <span className="text-slate-500 block">Créditos de processamento estendido</span>
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
                        <ShieldCheckIcon className="h-4 w-4 animate-pulse" />
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

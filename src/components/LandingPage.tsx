import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Sliders, ShieldCheck, Zap, Download, HelpCircle, Check, ArrowRight, Eye, RefreshCw, Layers, X } from 'lucide-react';
import { PlanDetails, SubscriptionTier } from '../types';

interface LandingPageProps {
  onStart: () => void;
  onSelectPlan: (plan: SubscriptionTier) => void;
  isAuthenticated: boolean;
}

export default function LandingPage({ onStart, onSelectPlan, isAuthenticated }: LandingPageProps) {
  // Before & After Interactive Slider State
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isSliding, setIsSliding] = useState(false);

  const handleSliderMove = (event: React.MouseEvent | React.TouchEvent) => {
    const container = event.currentTarget.getBoundingClientRect();
    let clientX = 'touches' in event ? event.touches[0].clientX : (event as React.MouseEvent).clientX;
    const x = clientX - container.left;
    const percentage = Math.max(0, Math.min(100, (x / container.width) * 100));
    setSliderPosition(percentage);
  };

  const PLANS: PlanDetails[] = [
    {
      id: 'free',
      name: 'Free',
      price: 'R$ 0',
      credits: '5 imagens',
      description: 'Ideal para experimentar e testar o refinamento em imagens isoladas.',
      features: [
        'Até 5 imagens grátis',
        'Remoção completa de EXIF/XMP',
        'Textura grain analógico leve',
        'Jitter de pixels básico',
        'Exportação em JPG/PNG'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'R$ 29',
      credits: 'Sem limites',
      description: 'Perfeito para criadores de conteúdo e designers reprocessarem imagens diariamente.',
      features: [
        'Processamento ILIMITADO',
        'Remoção de assinaturas invisíveis',
        'Adição de grão cinematográfico 4K',
        'Jitter de pixels avançado anti-detecção',
        'Suporte prioritário 24/7 de alta velocidade',
        'Acesso antecipado a novos filtros'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      price: 'R$ 79',
      credits: 'Lote / Alta prioridade',
      description: 'Gargalo eliminado. Envie pastas inteiras e reprocessar automaticamente via lote.',
      features: [
        'Processamento em lote (Batch Upload)',
        'Integração direta com Vercel Blob / S3',
        'Download instantâneo de arquivo ZIP',
        'Filtros personalizados para redes',
        'Configurações de marca d\'água personalizadas',
        'Faturamento corporativo por faturas'
      ]
    }
  ];

  const FAQS = [
    {
      q: 'Por que reprocessar imagens de IA para redes sociais?',
      a: 'Imagens geradas por geradores como Midjourney, Stable Diffusion ou DALL-E 3 contêm metadados (EXIF/XMP) e padrões de pixels característicos que algoritmos do Instagram, TikTok e Pinterest identificam facilmente. Muitas vezes estas redes dão menor alcance e distribuição orgânica para mídias geradas artificialmente para priorizar conteúdos "humanos". O PixelFlow AI re-renderiza a imagem, altera padrões de pixels, remove metadados e adiciona grão fotográfico analógico, fazendo com que as fotos pareçam tiradas por câmeras DSLR profissionais reais.'
    },
    {
      q: 'O que é a "Remoção de metadados" e "Jitter de pixels"?',
      a: 'A remoção deleta todas as tags técnicas embutidas no arquivo contendo "Generative AI", software criador, prompts e hashes ocultos. O jitter realiza micro-ajustes térmicos de ruído e cores de forma sub-pixelizada imperceptível aos olhos humanos, porém que desestrutura por completo as assinaturas digitais invisíveis e impressões digitais de softwares geradores.'
    },
    {
      q: 'Existe garantia de que meu alcance vai subir?',
      a: 'Nossa tecnologia limpa todos os sinalizadores de IA conhecidos nos arquivos. Isso garante que sua postagem seja tratada organicamente com o mesmo peso de uma foto normal de câmera. O sucesso final dependerá da qualidade visual e apelo do seu conteúdo!'
    },
    {
      q: 'Qual a diferença do processamento em Lote?',
      a: 'No plano Business, você pode arrastar e soltar até 50 imagens de uma vez. Nosso motor otimiza todas as imagens em paralelo e gera um arquivo compactado .ZIP automatizado em segundos para download imediato.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 lg:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.08),transparent_50%)]" />
        <div className="absolute top-1/2 left-0 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative z-10">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-black tracking-widest text-amber-400 mb-6 uppercase backdrop-blur-md"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Em Produção Beta Privada
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-5xl text-4xl sm:text-6xl md:text-[88px] leading-[0.9] font-black tracking-tighter mb-8 font-display text-white uppercase"
          >
            NATURALIZE <br/><span className="text-amber-400">IMAGENS IA</span> PARA REDES
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-400 font-medium"
          >
            Transforme gerações estéreis e plásticas de IA em conteúdo profissional e orgânico. Purgue metadados de rastreio, adicione grão cinematográfico analógico e otimize pixels instantaneamente.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={onStart}
              className="flex items-center gap-2 rounded-full bg-amber-400 text-black px-8 py-4 font-black uppercase tracking-widest text-xs hover:bg-amber-300 transition-all duration-200 transform hover:scale-[1.03] shadow-[0_0_30px_rgba(251,191,36,0.2)]"
            >
              <span>Acessar Painel Grátis</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#before-after"
              className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-600 px-8 py-4 font-bold text-xs uppercase tracking-wider transition-all duration-200 backdrop-blur-sm"
            >
              Ver Demonstração
            </a>
          </motion.div>

          {/* Social Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-14 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-xs text-slate-500 uppercase tracking-widest font-mono"
          >
            <span>✨ 4.2k+ Imagens Refinadas</span>
            <span className="hidden sm:inline">•</span>
            <span>📱 Ideal para Instagram, TikTok & Pinterest</span>
            <span className="hidden sm:inline">•</span>
            <span>🔒 EXIF Stripped Garantido</span>
          </motion.div>

        </div>
      </section>

      {/* Interactive Before & After Section */}
      <section id="before-after" className="py-20 bg-slate-950/60 border-y border-slate-900 overflow-hidden relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight font-display text-white">
              Sinta a diferença à primeira vista
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Arraste o controle deslizante abaixo para ver o processo anti-artificial. À esquerda: imagem plástica original de IA. À direita: imagem refinada PixelFlow com textura e sem marcas.
            </p>
          </div>

          {/* Interactive Slide Box */}
          <div className="mx-auto max-w-3xl relative h-[450px] rounded-2xl overflow-hidden border border-amber-500/20 shadow-2xl bg-slate-900 select-none">
            <div
              className="absolute inset-0 cursor-ew-resize"
              onMouseMove={handleSliderMove}
              onTouchMove={handleSliderMove}
              onMouseDown={() => setIsSliding(true)}
              onMouseUp={() => setIsSliding(false)}
              onTouchStart={() => setIsSliding(true)}
              onTouchEnd={() => setIsSliding(false)}
            >
              {/* After: Natural Image */}
              <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200')` }}>
                {/* Simulated high-quality filters & film grain overlay */}
                <div className="absolute inset-0 bg-slate-900/10 backdrop-contrast-[1.05] grayscale-[10%]" />
              </div>

              {/* Before: Plastic AI Look */}
              <div
                className="absolute inset-0 h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200')`,
                  clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                  filter: 'contrast(1.2) saturate(1.3) blur(0.2px)', // exaggerated "plastic" AI lighting
                }}
              >
                {/* Artificial plastik light filter overlay */}
                <div className="absolute inset-0 bg-yellow-500/5 mix-blend-color-burn" />
              </div>

              {/* Static Labels (Rendered on top to avoid clipping artifacts) */}
              <div 
                className="absolute top-4 left-4 bg-red-500/95 text-white font-mono text-[10px] px-2.5 py-1 rounded font-semibold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-sm shadow-lg transition-opacity duration-200 pointer-events-none"
                style={{ opacity: sliderPosition > 12 ? 1 : 0 }}
              >
                <X className="h-3 w-3 text-white" /> Imagem IA (Plástica + Metadados)
              </div>

              <div 
                className="absolute top-4 right-4 bg-slate-900/95 border border-amber-500/30 text-amber-400 font-mono text-[10px] px-2.5 py-1 rounded font-semibold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-sm shadow-lg transition-opacity duration-200 pointer-events-none"
                style={{ opacity: sliderPosition < 88 ? 1 : 0 }}
              >
                <Check className="h-3 w-3 text-emerald-400" /> PixelFlow (Natural + Sem EXIF)
              </div>

              {/* Slider Line & Handle */}
              <div
                className="absolute inset-y-0 w-0.5 bg-amber-400 pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-xl border border-slate-950 hover:scale-110 transition-transform">
                  <Sliders className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Eye className="h-4 w-4 text-amber-400" /> Arraste para comparar</span>
            <span className="flex items-center gap-1.5"><Layers className="h-4 w-4 text-amber-400" /> Textura fotográfica</span>
          </div>

        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-amber-400 uppercase tracking-wider font-mono">Alta Tecnologia de Refino</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
              Por que os algoritmos de redes favorecem o PixelFlow AI?
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-400">
              Redes sociais de alcance orgânico monitoram assinaturas internas e ruídos padrão. Purificamos seus arquivos reestruturando o conteúdo de cabo a rabo.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              
              {/* Feature 1 */}
              <div className="flex flex-col bg-slate-900/40 border border-slate-800 p-6 rounded-2xl relative group hover:border-amber-500/20 transition-all duration-300">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <dt className="text-lg font-bold text-white font-display">Ghost EXIF Stripping</dt>
                <dd className="mt-2 flex flex-auto flex-col text-sm leading-6 text-slate-400">
                  Deleta por completo hashes de geradores conhecidos, prompts inseridos e parâmetros de fabricação (Midjourney/DALL-E) ocultos nos metadados.
                </dd>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col bg-slate-900/40 border border-slate-800 p-6 rounded-2xl relative group hover:border-amber-500/20 transition-all duration-300">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sliders className="h-5 w-5" />
                </div>
                <dt className="text-lg font-bold text-white font-display">Sub-Pixel Jitter</dt>
                <dd className="mt-2 flex flex-auto flex-col text-sm leading-6 text-slate-400">
                  Aplica alterações criptográficas imperceptíveis no arranjo dos pixels para desfocar impressões digitais de IA e assinaturas de software.
                </dd>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col bg-slate-900/40 border border-slate-800 p-6 rounded-2xl relative group hover:border-amber-500/20 transition-all duration-300">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Zap className="h-5 w-5" />
                </div>
                <dt className="text-lg font-bold text-white font-display">Granulação Analógica</dt>
                <dd className="mt-2 flex flex-auto flex-col text-sm leading-6 text-slate-400">
                  Adiciona textura orgânica cinematográfica de grão de prata fotográfico, eliminando o aspecto de render 3D emborrachado e metalizado.
                </dd>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col bg-slate-900/40 border border-slate-800 p-6 rounded-2xl relative group hover:border-amber-500/20 transition-all duration-300">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Download className="h-5 w-5" />
                </div>
                <dt className="text-lg font-bold text-white font-display">Compressão Otimizada</dt>
                <dd className="mt-2 flex flex-auto flex-col text-sm leading-6 text-slate-400">
                  Nossos algoritmos salvam nas cores nativas RGB otimizadas reduzindo o peso do arquivo em até 80% sem perder nitidez de bordas.
                </dd>
              </div>

            </dl>
          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-slate-950/40 border-y border-slate-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(245,158,11,0.04),transparent_50%)]" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-amber-400 uppercase tracking-wider font-mono">Planos de Acesso</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
              Preço transparente para qualquer fluxo
            </p>
            <p className="mt-4 text-slate-400">
              Comece de graça e suba seu limite conforme a necessidade das suas campanhas.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
            {PLANS.map((plan) => {
              const isPro = plan.id === 'pro';
              return (
                <div
                  key={plan.id}
                  className={`flex flex-col justify-between rounded-2xl bg-slate-900/80 p-8 border ${
                    isPro ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative scale-105' : 'border-slate-800'
                  }`}
                >
                  {isPro && (
                    <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-bold text-slate-950 uppercase tracking-widest font-mono shadow">
                      Mais Popular
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                      {plan.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
                    
                    <div className="mt-6 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold tracking-tight text-white font-display">{plan.price}</span>
                      <span className="text-slate-500 text-sm">/mês</span>
                    </div>

                    <div className="mt-2 text-xs font-semibold text-amber-400 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                      <Zap className="h-3 w-3" /> {plan.credits}
                    </div>

                    <ul className="mt-8 space-y-3.5 text-xs text-slate-300">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2.5">
                          <Check className="h-4 w-4 text-amber-400 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => onSelectPlan(plan.id)}
                    className={`mt-10 block w-full rounded-xl py-3 text-center text-xs font-bold transition-all duration-200 ${
                      isPro
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {plan.id === 'free' ? 'Começar Grátis' : 'Assinar Plano'}
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <HelpCircle className="mx-auto h-8 w-8 text-amber-400 mb-4" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
              Dúvidas frequentes (FAQ)
            </h2>
            <p className="mt-4 text-slate-400">
              Tem alguma dúvida sobre faturamento, reprocessamento ou segurança de dados? Nós respondemos.
            </p>
          </div>

          <div className="space-y-6">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 hover:border-slate-700 transition-colors"
              >
                <dt className="text-lg font-bold text-white font-display flex items-start gap-3">
                  <span className="text-amber-400 font-mono">Q.</span>
                  <span>{faq.q}</span>
                </dt>
                <dd className="mt-3 text-sm leading-6 text-slate-400 pl-7">
                  {faq.a}
                </dd>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-16 relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-slate-900/10 border-t border-slate-900">
        <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4 font-display">
            Pronto para impulsionar seu tráfego?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8 text-sm">
            Crie sua conta em segundos de forma segura e filtre suas imagens gratuitamente agora mesmo.
          </p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 px-8 py-4 text-base font-bold text-slate-950 transition-all duration-200 shadow-xl transform hover:scale-105"
          >
            <span>Iniciar Processamento Grátis</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 text-slate-600 text-xs">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-slate-400 font-display">PixelFlow AI</span>
          </div>
          <div>
            <span>© 2026 PixelFlow AI Ltd. Todos os direitos reservados. Feito com tecnologia de remoção EXIF absoluta.</span>
          </div>
          <div className="flex gap-6 text-slate-500 font-mono">
            <a href="#" className="hover:text-amber-400 transition-colors">Termos</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Suporte</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

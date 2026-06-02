'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, Upload, Download, Check, ShieldCheck, HelpCircle, FileText, Settings, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SEOPageData } from '@/lib/seo-copy';
import Link from 'next/link';
import Image from 'next/image';
import { getApiUrl } from '@/lib/api-client';

interface SEOLandingClientProps {
  slug: string;
  data: SEOPageData;
}

export default function SEOLandingClient({ slug, data }: SEOLandingClientProps) {
  const { setAuthOpen } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [grain, setGrain] = useState(30);
  const [processingState, setProcessingState] = useState('');
  const [downloadName, setDownloadName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setDownloadName(`pixelflow_${selected.name.replace(/\.[^/.]+$/, "")}.png`);
      setPreviewUrl(URL.createObjectURL(selected));
      setProcessed(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setDownloadName(`pixelflow_${selected.name.replace(/\.[^/.]+$/, "")}.png`);
      setPreviewUrl(URL.createObjectURL(selected));
      setProcessed(false);
    }
  };

  const executeProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setProcessingState('🔍 Inicializando otimizador de imagem...');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', 'anonymous');
      formData.append('exifStripped', 'true');
      formData.append('pixelJitter', 'true');
      formData.append('grainApplied', 'true');
      formData.append('grainIntensity', String(grain));
      formData.append('compressionRate', '85');
      formData.append('outputFormat', 'image/jpeg');

      setProcessingState('🛡️ Transmitindo arquivo para buffer seguro...');
      await new Promise(resolve => setTimeout(resolve, 500));

      setProcessingState('⚡ Purificando cabeçalhos virtuais EXIF/XMP...');
      
      const response = await fetch(getApiUrl('/api/process-image'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro no processamento do servidor.');
      }

      setProcessingState(`🎬 Injetando ${grain}% de textura analógica orgânica...`);
      const result = await response.json();

      setPreviewUrl(result.downloadUrl);
      setProcessingState('🎉 Re-renderização concluída com aparência mais orgânica!');
      await new Promise(resolve => setTimeout(resolve, 800));

      setProcessing(false);
      setProcessed(true);
    } catch (err) {
      console.error(err);
      setProcessingState('❌ Falha no processamento. Tente novamente.');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProcessing(false);
    }
  };

  const downloadProcessed = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = downloadName || 'imagem_purificada.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#020617] text-slate-100 min-h-screen relative selection:bg-amber-400 selection:text-slate-950 pb-20">
      
      {/* Background spotlights */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/[0.04] rounded-full blur-[140px] pointer-events-none -mr-48 -mt-48" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-600/[0.03] rounded-full blur-[120px] pointer-events-none -ml-40" />

      <div className="mx-auto max-w-6xl px-6 pt-10 relative z-10">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 border-b border-slate-900 pb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Link href="/" className="hover:text-white transition-colors">HOME</Link>
            <span>/</span>
            <span className="text-amber-400 font-bold uppercase">{slug}</span>
          </div>

          <div className="flex gap-4">
            <Link 
              href="/blog" 
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Ver Blog de SEO</span>
            </Link>
            <Link 
              href="/" 
              className="text-xs font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar para Inicial</span>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-900 text-[10px] font-black tracking-widest text-amber-400 mb-6 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ferramenta Otimizada Gratuita
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-4 text-white leading-tight font-display uppercase">
            {data.h1}
          </h1>
          <p className="text-base sm:text-lg text-amber-400 font-medium tracking-tight mb-6 uppercase max-w-3xl mx-auto">
            {data.subtitle}
          </p>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto">
            {data.introText}
          </p>
        </div>

        {/* INTERACTIVE INTEGRATED WORKSPACE */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl mb-16 backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Column 1: Upload with progress and drag and drop */}
            <div className="lg:col-span-7 flex flex-col justify-between min-h-[340px]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Espaço de Processamento</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10">CONSOLA {data.tagline}</span>
              </div>

              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-amber-400/30 rounded-xl bg-slate-950/60 p-8 text-center cursor-pointer transition-all duration-200 group relative"
                >
                  <div className="mb-4 h-12 w-12 rounded-full bg-amber-400/5 border border-amber-400/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <Upload className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Arraste ou Clique para Carregar Foto</h3>
                  <p className="text-slate-500 text-[10px] uppercase font-mono tracking-widest">Suporte a JPEG, PNG ou WebP</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              ) : (
                <div className="flex-grow flex flex-col bg-slate-950/50 rounded-xl p-4 border border-slate-800 relative">
                  
                  {/* File Metadata Overlay before clean */}
                  <div className="flex gap-4 items-center border-b border-slate-800 pb-3 mb-3">
                    <div className="bg-amber-400/10 p-2 rounded text-amber-400 text-xs font-mono font-bold">RAW</div>
                    <div className="flex-grow min-w-0">
                      <span className="text-xs font-bold text-slate-100 block truncate">{file.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{Math.round(file.size / 1024)} KB • Status: Contém Metadados</span>
                    </div>
                    <button 
                      onClick={() => { setFile(null); setPreviewUrl(null); setProcessed(false); }}
                      className="text-xs font-bold text-slate-500 hover:text-red-400 uppercase font-mono cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>

                  {/* Sandbox preview display */}
                  <div className="flex-grow flex items-center justify-center relative rounded overflow-hidden max-h-[220px] bg-slate-1000 min-h-[180px]">
                    {previewUrl && (
                      <img 
                        src={previewUrl} 
                        alt="Preview original" 
                        className="max-h-[220px] max-w-full object-contain rounded"
                      />
                    )}
                    
                    {processing && (
                      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-20">
                        <div className="h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
                        <span className="text-xs font-mono font-semibold text-amber-400 text-center animate-pulse">{processingState}</span>
                      </div>
                    )}

                    {processed && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow z-10">
                        100% HIGIENIZADA
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Column 2: Parameters and Actions */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono block mb-1">Ajuste de Processo</span>
                  <p className="text-[11px] text-slate-400">Ative configurações térmicas avançadas abaixo.</p>
                </div>

                {/* Strip EXIF Toggle */}
                <div className="flex justify-between items-center p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-100">Expurgar EXIF/GPS/XMP</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">ATIVADO</span>
                </div>

                {/* Sub-Pixel Jitter */}
                <div className="flex justify-between items-center p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-100">Sub-Pixel Jitter</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 font-mono bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10">SUTIL</span>
                </div>

                {/* Grain controller */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-100">Textura de Grão Fotográfico</span>
                    <span className="text-xs font-mono text-amber-400 font-bold">{grain}%</span>
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={100}
                    value={grain}
                    onChange={(e) => setGrain(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1 rounded"
                  />
                  <span className="text-[9px] text-slate-500 font-mono block mt-1 uppercase">Interrompe a malha padrão estéril de pixels</span>
                </div>
              </div>

              {/* Functional Process triggers */}
              <div className="pt-6 border-t border-slate-900 mt-6 lg:mt-0">
                {!file ? (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all cursor-pointer"
                  >
                    <span>Carregar Foto Primeiro</span>
                  </button>
                ) : !processed ? (
                  <button 
                    onClick={executeProcess}
                    disabled={processing}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 animate-pulse text-black" />
                    <span>Executar Refinamento</span>
                  </button>
                ) : (
                  <div className="space-y-2.5">
                    <button 
                      onClick={downloadProcessed}
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Baixar imagem sem metadados</span>
                    </button>
                    <button 
                      onClick={() => { setFile(null); setPreviewUrl(null); setProcessed(false); }}
                      className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      Processar Outro Arquivo
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* ARTICLES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-2xl font-black text-white font-display mb-6 uppercase">
              {data.featuresTitle}
            </h2>
            <div className="space-y-6">
              {data.features.map((feature, idx) => (
                <div key={idx} className="border-l-2 border-amber-400 pl-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wide mb-1 flex items-center gap-1.5 font-display text-amber-400">
                    <Check className="h-3.5 w-3.5 text-amber-400" />
                    {feature.h3}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-6 uppercase font-display">
              {data.stepsTitle}
            </h2>
            <div className="space-y-4">
              {data.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-slate-900 bg-slate-900/10">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-mono font-bold text-amber-400 flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* REGISTRATION CTA CARD */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-[#0e1630] border border-slate-850 p-8 sm:p-10 text-center relative overflow-hidden mb-20 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
          
          <h2 className="text-2xl sm:text-3xl font-black text-white font-display mb-4 uppercase tracking-tight">
            REPROCESSAR EM LOTE COM PIXELFLOW PRO
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Esqueça arquivos unitários. Registre-se e desbloqueie o carregamento automático de pastas inteiras via ZIP, remova restrições de processamento diário e recupere 100% da integridade do seu portfólio.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setAuthOpen(true)}
              className="flex items-center gap-2 rounded-full bg-amber-400 px-8 py-4 font-black uppercase tracking-widest text-xs text-slate-950 hover:bg-amber-300 transition-all shadow-[0_0_30px_rgba(251,191,36,0.2)] transform hover:scale-[1.02] cursor-pointer"
            >
              <span>Criar minha conta agora</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link 
              href="/#pricing"
              className="px-8 py-4 rounded-full border border-slate-800 hover:bg-slate-900 transition-all text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white"
            >
              Conhecer os planos
            </Link>
          </div>
        </div>

        {/* FAQ LIST */}
        <div>
          <div className="flex items-center gap-2 mb-8 justify-center">
            <HelpCircle className="h-4 w-4 text-amber-400" />
            <h2 className="text-2xl font-black text-white font-display uppercase tracking-tight">Perguntas Frequentes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {data.faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-950 rounded-xl border border-slate-900 p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2 font-display min-h-[32px] leading-snug">
                    {faq.q}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-900 text-[9px] text-amber-400/40 font-mono uppercase tracking-widest">
                  Fato verificado por PixelFlow
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

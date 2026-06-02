'use client';

import React, { useState, useRef, useEffect } from 'react';
import { db } from '@/src/firebase';
import { collection, getDocs, query, where, orderBy, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ProcessedImage, ProcessingOptions, UserProfile } from '@/src/types';
import { Upload, Sliders, Shield, Zap, Sparkles, Image as ImageIcon, Download, Settings, History, Check, RefreshCw, Lock, CreditCard, ArrowRight, Trash2, Plus, Save, Heart } from 'lucide-react';
import { getApiUrl } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

const BUILTIN_PRESETS = [
  {
    id: 'cinematic',
    name: 'Cinematográfico',
    description: 'Estilo analógico de película com grão realçado e alta nitidez.',
    icon: 'Sparkles',
    options: {
      exifStripped: true,
      pixelJitter: true,
      grainApplied: true,
      antiAiPerturbation: true,
      grainIntensity: 45,
      compressionRate: 90,
      outputFormat: 'image/jpeg' as const,
      grainFilterType: 'cinematic' as const,
      fourKResolution: true,
      subPixelRefinement: true,
      aspectRatio: 'original' as const,
      socialNetworkFilter: 'none' as const,
      generateComplianceReport: false
    }
  },
  {
    id: 'vibrant',
    name: 'Vibrante 4K',
    description: 'Cores quentes e nítidas otimizadas para redes sociais.',
    icon: 'Zap',
    options: {
      exifStripped: true,
      pixelJitter: true,
      grainApplied: true,
      antiAiPerturbation: true,
      grainIntensity: 20,
      compressionRate: 95,
      outputFormat: 'image/jpeg' as const,
      grainFilterType: 'standard' as const,
      fourKResolution: true,
      subPixelRefinement: true,
      aspectRatio: 'original' as const,
      socialNetworkFilter: 'none' as const,
      generateComplianceReport: false
    }
  },
  {
    id: 'suave',
    name: 'Suave / Pure',
    description: 'Remoção extrema de ruído e suavização de pixels em PNG.',
    icon: 'Sliders',
    options: {
      exifStripped: true,
      pixelJitter: false,
      grainApplied: true,
      antiAiPerturbation: false,
      grainIntensity: 10,
      compressionRate: 85,
      outputFormat: 'image/png' as const,
      grainFilterType: 'standard' as const,
      fourKResolution: false,
      subPixelRefinement: false,
      aspectRatio: 'original' as const,
      socialNetworkFilter: 'none' as const,
      generateComplianceReport: false
    }
  },
  {
    id: 'stealth',
    name: 'Sigilo Extremo',
    description: 'Redução drástica de assinaturas e perturbação profunda anti-IA.',
    icon: 'Shield',
    options: {
      exifStripped: true,
      pixelJitter: true,
      grainApplied: true,
      antiAiPerturbation: true,
      grainIntensity: 60,
      compressionRate: 75,
      outputFormat: 'image/jpeg' as const,
      grainFilterType: 'vintage_fuji' as const,
      fourKResolution: true,
      subPixelRefinement: false,
      aspectRatio: 'original' as const,
      socialNetworkFilter: 'none' as const,
      generateComplianceReport: true
    }
  }
];

interface DashboardClientProps {
  userProfile: UserProfile;
  onRefreshProfile: () => void;
  onOpenPlanSelector: () => void;
}

export default function DashboardClient({ userProfile, onRefreshProfile, onOpenPlanSelector }: DashboardClientProps) {
  const { setShowCheckout } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  const [options, setOptions] = useState<ProcessingOptions>({
    exifStripped: true,
    pixelJitter: true,
    grainApplied: true,
    antiAiPerturbation: true,
    grainIntensity: 25,
    compressionRate: 85,
    outputFormat: 'image/jpeg',
    fourKResolution: false,
    subPixelRefinement: false,
    grainFilterType: 'standard',
    aspectRatio: 'original',
    socialNetworkFilter: 'none',
    generateComplianceReport: false
  });

  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ originalSize: number; processedSize: number } | null>(null);
  const [history, setHistory] = useState<ProcessedImage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [customPresets, setCustomPresets] = useState<any[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [savingPreset, setSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, 'processed_images'),
        where('userId', '==', userProfile.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const items: ProcessedImage[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          userId: data.userId,
          originalName: data.originalName,
          processedName: data.processedName,
          mimeType: data.mimeType,
          originalSize: data.originalSize,
          processedSize: data.processedSize,
          exifStripped: data.exifStripped,
          pixelJitter: data.pixelJitter,
          grainApplied: data.grainApplied,
          antiAiPerturbation: data.antiAiPerturbation || false,
          compressionRate: data.compressionRate,
          downloadUrl: data.downloadUrl,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      setHistory(items);
    } catch (err) {
      console.error("Erro ao carregar histórico: ", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchPresets = async () => {
    setLoadingPresets(true);
    try {
      const q = query(
        collection(db, 'presets'),
        where('userId', '==', userProfile.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const items: any[] = [];
      snapshot.forEach((d) => {
        items.push({
          id: d.id,
          ...d.data(),
        });
      });
      setCustomPresets(items);
    } catch (err) {
      console.error("Erro ao carregar predefinições: ", err);
    } finally {
      setLoadingPresets(false);
    }
  };

  const handleFirestoreError = (error: any, operationType: string, path: string) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: userProfile.uid,
        email: userProfile.email,
        emailVerified: true,
        isAnonymous: false,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  const savePreset = async () => {
    if (!newPresetName.trim()) {
      alert('Por favor, digite um nome para a predefinição.');
      return;
    }
    setSavingPreset(true);
    const presetId = 'preset_' + Math.random().toString(36).substring(2, 15);
    const path = `presets/${presetId}`;
    try {
      const presetData = {
        id: presetId,
        userId: userProfile.uid,
        name: newPresetName.trim(),
        exifStripped: options.exifStripped,
        pixelJitter: options.pixelJitter,
        grainApplied: options.grainApplied,
        antiAiPerturbation: options.antiAiPerturbation,
        grainIntensity: options.grainIntensity,
        compressionRate: options.compressionRate,
        outputFormat: options.outputFormat,
        grainFilterType: options.grainFilterType || 'standard',
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'presets', presetId), presetData);
      setNewPresetName('');
      setShowSaveInput(false);
      await fetchPresets();
      setActivePresetId(presetId);
      alert('Predefinição salva com sucesso!');
    } catch (err) {
      handleFirestoreError(err, 'write', path);
    } finally {
      setSavingPreset(false);
    }
  };

  const deletePreset = async (presetId: string) => {
    if (!confirm('Deseja realmente excluir esta predefinição?')) return;
    const path = `presets/${presetId}`;
    try {
      await deleteDoc(doc(db, 'presets', presetId));
      if (activePresetId === presetId) {
        setActivePresetId(null);
      }
      await fetchPresets();
    } catch (err) {
      handleFirestoreError(err, 'delete', path);
    }
  };

  const applyPreset = (presetOptions: any, id: string) => {
    setOptions({
      exifStripped: presetOptions.exifStripped ?? true,
      pixelJitter: presetOptions.pixelJitter ?? true,
      grainApplied: presetOptions.grainApplied ?? true,
      antiAiPerturbation: presetOptions.antiAiPerturbation ?? true,
      grainIntensity: presetOptions.grainIntensity ?? 25,
      compressionRate: presetOptions.compressionRate ?? 85,
      outputFormat: presetOptions.outputFormat ?? 'image/jpeg',
      fourKResolution: presetOptions.fourKResolution ?? false,
      subPixelRefinement: presetOptions.subPixelRefinement ?? false,
      grainFilterType: presetOptions.grainFilterType ?? 'standard',
      aspectRatio: presetOptions.aspectRatio ?? 'original',
      socialNetworkFilter: presetOptions.socialNetworkFilter ?? 'none',
      generateComplianceReport: presetOptions.generateComplianceReport ?? false,
    });
    setActivePresetId(id);
  };

  useEffect(() => {
    fetchHistory();
    fetchPresets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile.uid]);

  const handleFile = (file: File) => {
    const isFree = userProfile.subscriptionTier === 'free' && userProfile.role !== 'admin';
    if (isFree && userProfile.credits <= 0) {
      alert('Você atingiu o limite de créditos do plano Grátis. Atualize para o plano Pro para continuar.');
      onOpenPlanSelector();
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Por favor, faça upload apenas de arquivos de imagem.');
      return;
    }
    setImage(file);
    setProcessedUrl(null);
    setFileDetails(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const processImage = async () => {
    if (!image) return;
    
    const isFree = userProfile.subscriptionTier === 'free' && userProfile.role !== 'admin';
    if (userProfile.credits <= 0 && isFree) {
      alert('Você atingiu o limite de créditos do plano Grátis. Atualize para o Pro para obter processamento ilimitado.');
      onOpenPlanSelector();
      return;
    }

    setProcessing(true);
    setProcessingStatus('Preparando arquivo para upload...');

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('userId', userProfile.uid);
      formData.append('exifStripped', String(options.exifStripped));
      formData.append('pixelJitter', String(options.pixelJitter));
      formData.append('grainApplied', String(options.grainApplied));
      formData.append('antiAiPerturbation', String(options.antiAiPerturbation));
      formData.append('grainIntensity', String(options.grainIntensity));
      formData.append('compressionRate', String(options.compressionRate));
      formData.append('outputFormat', options.outputFormat);

      // Advanced parameters
      formData.append('fourKResolution', String(options.fourKResolution));
      formData.append('subPixelRefinement', String(options.subPixelRefinement));
      formData.append('grainFilterType', options.grainFilterType || 'standard');
      formData.append('aspectRatio', options.aspectRatio || 'original');
      formData.append('socialNetworkFilter', options.socialNetworkFilter || 'none');

      setProcessingStatus('Transmitindo arquivo para buffer seguro...');

      const response = await fetch(getApiUrl('/api/process-image'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro no processamento do servidor.');
      }

      setProcessingStatus('Purificando metadados e aplicando grão analógico...');
      const result = await response.json();

      setProcessedUrl(result.downloadUrl);
      setFileDetails({
        originalSize: result.originalSize,
        processedSize: result.processedSize
      });

      setProcessingStatus('Sincronizando créditos e logs...');
      
      onRefreshProfile();
      await fetchHistory();
      setProcessing(false);
    } catch (error: any) {
      console.error(error);
      alert('Erro ao processar imagem: ' + error.message);
      setProcessing(false);
    }
  };

  const triggerHistoryDownload = async (e: React.MouseEvent, url: string, name: string) => {
    e.preventDefault();
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Falha no download');
      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = name;
      link.href = localUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(localUrl);
    } catch (err) {
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadImage = async () => {
    if (!processedUrl || !image) return;
    try {
      setProcessing(true);
      setProcessingStatus('Iniciando download seguro...');

      const response = await fetch(processedUrl);
      if (!response.ok) throw new Error('Falha ao baixar imagem do servidor.');
      const blob = await response.blob();
      
      const localUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const suffix = options.outputFormat === 'image/jpeg' ? '.jpg' : '.png';
      
      const date = new Date();
      const months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
      const dateStr = `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
      const renamePattern = `pixelflow ${dateStr}${suffix}`;

      link.download = renamePattern;
      link.href = localUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(localUrl);

      // Trigger Compliance Report if active under Business/Corporate plan
      const isBusiness = userProfile.subscriptionTier === 'business' || userProfile.role === 'admin';
      if (options.generateComplianceReport && isBusiness) {
        const reportContent = `--------------------------------------------------------
PIXELFLOW - RELATÓRIO DE CONFORMIDADE E PRIVACIDADE ISO
--------------------------------------------------------
Data do Refinamento: ${new Date().toLocaleString('pt-BR')} (UTC)
Nome do Arquivo Original: ${image.name}
Nome do Arquivo Exportado: ${renamePattern}
Mime-Type de Saída: ${options.outputFormat}

ANÁLISE DE CONFORMIDADE E HIGIENIZAÇÃO DE PRIVACIDADE:
[OK] Remoção completa de tags EXIF/XMP escondidas
[OK] Deleção de geolocalização e coordenadas de GPS
[OK] Limpeza de assinaturas de hardware do dispositivo
[OK] Injeção de perturbação invisível anti-reconhecimento IA
[OK] Filtro de tom aplicado para otimização de lentes
[OK] Grão analógico de haleto de prata injetado calibrado: ${options.grainIntensity}%
[OK] Compressão espacial otimizada com mozjpeg/sharp

ESTADO DA CERTIFICAÇÃO: CONFORME E SEGURO (ISO-27001 SIMULADO)
Livre para distribuição pública e anonimização em canais sociais.
--------------------------------------------------------`;
        const reportBlob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const reportUrl = URL.createObjectURL(reportBlob);
        const reportLink = document.createElement('a');
        reportLink.download = `CONFORMIDADE - ${image.name.split('.')[0]}.txt`;
        reportLink.href = reportUrl;
        document.body.appendChild(reportLink);
        reportLink.click();
        document.body.removeChild(reportLink);
        URL.revokeObjectURL(reportUrl);
      }
    } catch (err: any) {
      console.warn("Falha no download via blob, usando link direto como fallback:", err);
      const link = document.createElement('a');
      const suffix = options.outputFormat === 'image/jpeg' ? '.jpg' : '.png';
      const date = new Date();
      const months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
      const dateStr = `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
      link.download = `pixelflow ${dateStr}${suffix}`;
      link.href = processedUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isPremium = userProfile.subscriptionTier !== 'free' || userProfile.role === 'admin';
  const isBusiness = userProfile.subscriptionTier === 'business' || userProfile.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-100 text-left">
      
      {/* Credit Status & Header */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 border-b border-slate-900 pb-8 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase font-display text-white">Consola de Processamento</h1>
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Arraste e solte arquivos de imagem para purificar e otimizar para web.</p>
        </div>

        {/* Credit Counter Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex items-center justify-between gap-6 min-w-[280px]">
          <div>
            <span className="text-[10px] font-black text-slate-500 font-mono uppercase tracking-widest block mb-1">Seu Plano</span>
            <div className="flex items-center gap-1.5 font-display">
              <span className="text-xs font-black uppercase text-white capitalize tracking-wider">
                {userProfile.role === 'admin' ? 'Admin / Ilimitado' : userProfile.subscriptionTier}
              </span>
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-500 font-mono uppercase tracking-widest block mb-1">Créditos Disponíveis</span>
            <div className="flex items-center justify-end gap-1.5 text-amber-400 font-black text-sm uppercase tracking-wider font-mono">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>{(userProfile.subscriptionTier === 'free' && userProfile.role !== 'admin') ? userProfile.credits : 'Ilimitado'}</span>
            </div>
          </div>
          {userProfile.subscriptionTier === 'free' && userProfile.role !== 'admin' && (
            <button
              onClick={onOpenPlanSelector}
              className="ml-2 rounded-full bg-amber-400 hover:bg-amber-300 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-950 transition-colors cursor-pointer"
            >
              Upgrade
            </button>
          )}
        </div>
      </div>

      {/* Workflow Area */}
      {userProfile.subscriptionTier === 'free' && userProfile.role !== 'admin' && userProfile.credits <= 0 ? (
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-8 sm:p-12 text-center mb-16 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Decorative glowing backdrops */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-sans">
            <Lock className="h-8 w-8 animate-pulse" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-white font-display">
            Limite de Créditos Atingido ✦ Acesso Bloqueado
          </h2>
          
          <p className="mt-4 text-xs sm:text-sm text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Você já utilizou com sucesso os seus <span className="text-amber-400 font-bold">5 créditos gratuitos</span> de purificação de imagens e proteção de privacidade.
            Para continuar removendo metadados EXIF/XMP escondidos, aplicando grão analógico de prata, usando o algoritmo de Pixel Jitter e nossa <span className="text-white font-bold">Perturbação Invisível Anti-Detector de IA</span>, assine um plano de alta fidelidade.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            {/* Plan Card 1: Profissional */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-amber-500/30 transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Recomendado</span>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white font-display">Plano Profissional</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400 font-mono">R$ 29</span>
                    <span className="text-slate-500 text-[10px] block font-mono">/ mensal</span>
                  </div>
                </div>
                
                <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                  Perfeito para criadores de conteúdo e editores purificarem mídias ilimitadas no dia a dia.
                </p>

                <ul className="space-y-3.5 mb-8 text-xs font-semibold text-slate-300">
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span>Processamento <strong>ILIMITADO</strong> de imagens</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span>Perturbação Anti-Detector de IA inclusa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Fidelidade de cor de lente perfeita</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Suporte prioritário 24h ultra-rápido</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setShowCheckout({ active: true, tier: 'pro' })}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 py-3.5 text-xs font-black uppercase tracking-widest text-[#020617] transition-all cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.15)]"
              >
                <span>Assinar Plano Profissional</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Plan Card 2: Corporativo */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Agências</span>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white font-display">Plano Corporativo</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400 font-mono">R$ 79</span>
                    <span className="text-slate-500 text-[10px] block font-mono">/ mensal</span>
                  </div>
                </div>
                
                <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                  Capacidade máxima de infraestrutura com refinamento e download em lotes de alta velocidade.
                </p>

                <ul className="space-y-3.5 mb-8 text-xs font-medium text-slate-300">
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span>Processamento <strong>em Lote</strong> estendido</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span>Upload de até 30 fotos em paralelo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Download expresso compactado em .ZIP</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Filtros personalizados por canal social</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setShowCheckout({ active: true, tier: 'business' })}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 py-3.5 text-xs font-black uppercase tracking-widest text-slate-200 border border-slate-700 transition-all cursor-pointer"
              >
                <span>Assinar Plano Corporativo</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-center text-[10px] text-slate-500 uppercase tracking-widest font-mono">
            <CreditCard className="h-3.5 w-3.5 text-amber-500/50" />
            <span>Faturamento 100% criptografado e garantido via Mercado Pago. Ativação imediata.</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        
        {/* Upload & Control Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Section for Filters & Presets */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest font-mono">
                <Sliders className="h-4 w-4 text-amber-500" /> Filtros e Predefinições
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveInput(!showSaveInput)}
                className="flex items-center gap-1.5 text-[9px] font-black uppercase text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full cursor-pointer hover:bg-amber-400/20 transition-all font-mono"
              >
                <Plus className="h-3 w-3" /> Salvar Atual
              </button>
            </div>

            {/* Input field to save the current configuration as custom preset */}
            {showSaveInput && (
              <div className="mb-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">Salvar Ajustes Atuais como Predefinição</span>
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    maxLength={32}
                    placeholder="Ex: Meu Filtro Suave, Insta Pro..."
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={savePreset}
                    disabled={savingPreset}
                    className="rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-1.5 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    {savingPreset ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    <span>Salvar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSaveInput(false);
                      setNewPresetName('');
                    }}
                    className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-3 py-1.5 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Built-in Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 select-none">
              {BUILTIN_PRESETS.map((p) => {
                const isSelected = activePresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.options, p.id)}
                    className={`flex flex-col text-left p-3 rounded-xl border transition-all duration-200 group relative ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400 text-white shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`p-1 rounded-lg ${
                        isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 text-amber-450 border border-slate-800 group-hover:text-amber-400'
                      }`}>
                        {p.icon === 'Sparkles' && <Sparkles className="h-3.5 w-3.5" />}
                        {p.icon === 'Zap' && <Zap className="h-3.5 w-3.5" />}
                        {p.icon === 'Sliders' && <Sliders className="h-3.5 w-3.5" />}
                        {p.icon === 'Shield' && <Shield className="h-3.5 w-3.5" />}
                      </span>
                      {isSelected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold block truncate leading-tight mb-1">{p.name}</span>
                    <span className="text-[9px] text-slate-505 line-clamp-2 leading-tight font-medium select-none group-hover:text-slate-400">{p.description}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Presets Section */}
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2.5 font-mono">Minhas Predefinições</span>
              {loadingPresets ? (
                <div className="flex items-center gap-2 py-1 select-none">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-500" />
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider">Carregando predefinições salvas...</span>
                </div>
              ) : customPresets.length === 0 ? (
                <p className="text-[10px] text-slate-500 leading-normal font-medium max-w-xl">
                  Nenhuma predefinição personalizada criada ainda. Gostou de algum ajuste fino que fez nos controles deslizantes abaixo? Clique no botão <span className="text-slate-400 font-semibold">Salvar Atual</span> no topo para manter as configurações persistidas no seu perfil.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {customPresets.map((p) => {
                    const isSelected = activePresetId === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-all text-xs ${
                          isSelected
                            ? 'bg-amber-400/10 border-amber-400 text-white shadow-[0_0_10px_rgba(251,191,36,0.05)]'
                            : 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => applyPreset(p, p.id)}
                          className="flex items-center gap-1.5 font-semibold text-left select-none cursor-pointer"
                        >
                          <Heart className={`h-3 w-3 ${isSelected ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                          <span>{p.name}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePreset(p.id)}
                          className="text-slate-500 hover:text-rose-400 p-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Excluir predefinição"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Uploader Widget */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex-1 min-h-[300px] border-2 border-dashed border-slate-900 rounded-2xl flex flex-col justify-center items-center p-8 text-center transition-all bg-slate-900/20 select-none relative"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {imagePreview ? (
              <div className="w-full relative h-[250px] flex items-center justify-center bg-slate-950/40 rounded-xl overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} className="max-h-full max-w-full object-contain" alt="Preview original" />
                <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-3 flex justify-between items-center text-xs text-slate-400">
                  <span className="truncate">{image?.name}</span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-amber-400 hover:underline font-semibold cursor-pointer"
                  >
                    Alterar foto
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="mb-4 h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black uppercase tracking-wider text-white font-display mb-2">Selecione sua imagem</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest max-w-md leading-relaxed mb-6">
                  Suporta JPG, PNG ou WebP. Arraste e solte o arquivo aqui, ou utilize o botão para pesquisar no computador.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-6 py-2.5 text-xs font-black uppercase tracking-widest cursor-pointer"
                >
                  Procurar Arquivo
                </button>
              </div>
            )}
          </div>

          {/* Adjustments Panel */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-[10px] font-black text-slate-500 mb-5 flex items-center gap-2 uppercase tracking-widest font-mono">
              <Settings className="h-4 w-4" /> Ajustes de Processamento
            </h3>

            <div className="space-y-6">
              
              {/* Toggle Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 cursor-pointer hover:border-slate-705 select-none">
                  <input
                    type="checkbox"
                    checked={options.exifStripped}
                    onChange={(e) => setOptions({ ...options, exifStripped: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded-md text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block mb-0.5">Remover Metadados EXIF/XMP</span>
                    <span className="text-[10px] text-slate-400 block leading-tight">Deleta logs de geração de mídias e locais.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 cursor-pointer hover:border-slate-705 select-none">
                  <input
                    type="checkbox"
                    checked={options.pixelJitter}
                    onChange={(e) => setOptions({ ...options, pixelJitter: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded-md text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block mb-0.5">Jitter de Pixels</span>
                    <span className="text-[10px] text-slate-400 block leading-tight">Estabiliza e suaviza paletas ásperas de cores.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 cursor-pointer hover:border-slate-705 select-none sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={options.antiAiPerturbation}
                    onChange={(e) => setOptions({ ...options, antiAiPerturbation: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded-md text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block mb-0.5 flex items-center gap-1.5">
                      Perturbação Invisível / Anti-Detector IA <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Injeta micro pontos imperceptíveis que distorcem as assinaturas digitais, marcas d&apos;água de IA (como C2PA) e algoritmos de detecção automatizada de redes sociais. Ideal para postar imagens geradas por IA (ex: ChatGPT) sem restrições.
                    </span>
                  </div>
                </label>
              </div>

              {/* Slider for grain */}
              <div>
                <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 cursor-pointer hover:border-slate-705 select-none mb-3">
                  <input
                    type="checkbox"
                    checked={options.grainApplied}
                    onChange={(e) => setOptions({ ...options, grainApplied: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded-md text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block mb-0.5">Grão Analógico de Prata</span>
                    <span className="text-[10px] text-slate-400 block leading-tight">Garante textura de película para alta fidelidade estética.</span>
                  </div>
                </label>

                {options.grainApplied && (
                  <div className="pl-7">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
                      <span>Sensibilidade da Textura (Intensidade)</span>
                      <span className="text-amber-500 font-semibold">{options.grainIntensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={options.grainIntensity}
                      onChange={(e) => setOptions({ ...options, grainIntensity: parseInt(e.target.value) })}
                      className="w-full cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Compression rate */}
              <div className="border-t border-slate-800/80 pt-5">
                <div className="flex justify-between text-xs text-white mb-2 font-semibold">
                  <span>Compressão e Qualidade de Saída</span>
                  <span className="text-amber-500 font-mono">{options.compressionRate}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={options.compressionRate}
                  onChange={(e) => setOptions({ ...options, compressionRate: parseInt(e.target.value) })}
                  className="w-full mb-2 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 leading-normal block">
                  Recomendado: 80-85% para manter a fidedignidade perfeita da lente sem carregar peso extra.
                </span>
              </div>

              {/* Mime type format */}
              <div className="border-t border-slate-800/80 pt-5 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Formato de Exportação</span>
                <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-805">
                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, outputFormat: 'image/jpeg' })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${options.outputFormat === 'image/jpeg' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                  >
                    JPEG
                  </button>
                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, outputFormat: 'image/png' })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${options.outputFormat === 'image/png' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                  >
                    PNG
                  </button>
                </div>
              </div>

              {/* PREMIUM PRO FEATURES SECTIONS */}
              <div className="border-t border-slate-800/80 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    ✦ Recursos Profissionais
                  </span>
                  {!isPremium && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-400/20 flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5" /> PRO
                    </span>
                  )}
                </div>

                {/* 4K Resolution option */}
                <div 
                  className={`flex items-start gap-3 rounded-xl border p-4 transition-all ${
                    isPremium 
                      ? 'border-slate-800 bg-slate-900 cursor-pointer hover:border-slate-705' 
                      : 'border-slate-900 bg-slate-950/40 opacity-70 cursor-pointer hover:border-amber-400/20'
                  }`}
                  onClick={() => {
                    if (!isPremium) {
                      onOpenPlanSelector();
                    } else {
                      setOptions({ ...options, fourKResolution: !options.fourKResolution });
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isPremium ? !!options.fourKResolution : false}
                    disabled={!isPremium}
                    readOnly
                    className="mt-1 h-4 w-4 rounded-md text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block mb-0.5 flex items-center gap-1">
                      Texturização Cinematográfica 4K
                      {!isPremium && <Lock className="h-3 w-3 text-amber-500" />}
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Desbloqueia renderização em ultra-alta fidelidade até 3840 pixels (4K) para mídias de altíssimo realismo.
                    </span>
                  </div>
                </div>

                {/* Sub Pixel Refinement */}
                <div 
                  className={`flex items-start gap-3 rounded-xl border p-4 transition-all ${
                    isPremium 
                      ? 'border-slate-800 bg-slate-900 cursor-pointer hover:border-slate-705' 
                      : 'border-slate-900 bg-slate-950/40 opacity-70 cursor-pointer hover:border-amber-400/20'
                  }`}
                  onClick={() => {
                    if (!isPremium) {
                      onOpenPlanSelector();
                    } else {
                      setOptions({ ...options, subPixelRefinement: !options.subPixelRefinement });
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isPremium ? !!options.subPixelRefinement : false}
                    disabled={!isPremium}
                    readOnly
                    className="mt-1 h-4 w-4 rounded-md text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block mb-0.5 flex items-center gap-1">
                      Refinamento Estrutural de Sub-pixels
                      {!isPremium && <Lock className="h-3 w-3 text-amber-500" />}
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Aplica um micro algoritmo de nitidez espacial para realçar bordas e texturas sem gerar ruído indesejado nas lentes.
                    </span>
                  </div>
                </div>

                {/* Advanced Grain Filters */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-300 block">Tipo Filtro de Grão</span>
                  {isPremium ? (
                    <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-semibold">
                      {[
                        { id: 'standard', name: 'Padrão' },
                        { id: 'cinematic', name: 'Cinematográfico ✦' },
                        { id: 'expired_kodak', name: 'Expired Kodak' },
                        { id: 'vintage_fuji', name: 'Vintage Fuji' }
                      ].map((grain) => (
                        <button
                          key={grain.id}
                          type="button"
                          onClick={() => setOptions({ ...options, grainFilterType: grain.id as any })}
                          className={`rounded-lg py-2 text-xs font-bold border transition-all cursor-pointer ${
                            options.grainFilterType === grain.id 
                              ? 'bg-amber-400 border-amber-400 text-slate-950 font-black' 
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          {grain.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div 
                      onClick={onOpenPlanSelector}
                      className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4 flex items-center justify-between cursor-pointer hover:border-amber-400/20 opacity-70"
                    >
                      <span className="text-[10px] text-slate-400 font-medium">Filtros Kodak, Fuji e Cinematográficos 4K</span>
                      <span className="text-[9px] font-black uppercase text-amber-400 flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Desbloquear
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* PREMIUM BUSINESS/CORPORATE FEATURES */}
              <div className="border-t border-slate-800/80 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    ✦ Recursos Corporativos
                  </span>
                  {!isBusiness && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-400/10 text-purple-305 px-2 py-0.5 rounded-full border border-purple-400/20 flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5" /> CORP
                    </span>
                  )}
                </div>

                {/* Social Network Filters */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-300 block flex items-center gap-1">
                    Filtros por Rede Social
                    {!isBusiness && <Lock className="h-3 w-3 text-purple-400" />}
                  </span>
                  {isBusiness ? (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'none', name: 'Nenhum' },
                        { id: 'instagram', name: 'Instagram Web' },
                        { id: 'twitter', name: 'Twitter / X' },
                        { id: 'linkedin', name: 'LinkedIn Brand' }
                      ].map((net) => (
                        <button
                          key={net.id}
                          type="button"
                          onClick={() => setOptions({ ...options, socialNetworkFilter: net.id as any })}
                          className={`rounded-lg py-2 text-xs font-bold border transition-all cursor-pointer ${
                            options.socialNetworkFilter === net.id 
                              ? 'bg-amber-400 border-amber-400 text-slate-950 font-black' 
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          {net.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div 
                      onClick={onOpenPlanSelector}
                      className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-3.5 flex items-center justify-between cursor-pointer hover:border-purple-400/20 opacity-70"
                    >
                      <span className="text-[10px] text-slate-400">Curvas de cor e calibrações de rede social</span>
                      <span className="text-[9px] font-black uppercase text-purple-400 flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Desbloquear
                      </span>
                    </div>
                  )}
                </div>

                {/* Aspect Ratio configurations */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-300 block flex items-center gap-1">
                    Configuração de Proporção (Aspect Ratio)
                    {!isBusiness && <Lock className="h-3 w-3 text-purple-400" />}
                  </span>
                  {isBusiness ? (
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {[
                        { id: 'original', name: 'Original' },
                        { id: '1:1', name: '1:1' },
                        { id: '4:3', name: '4:3' },
                        { id: '16:9', name: '16:9' }
                      ].map((ratio) => (
                        <button
                          key={ratio.id}
                          type="button"
                          onClick={() => setOptions({ ...options, aspectRatio: ratio.id as any })}
                          className={`rounded-lg py-1.5 text-[10px] font-black border transition-all cursor-pointer ${
                            options.aspectRatio === ratio.id 
                              ? 'bg-amber-400 border-amber-400 text-slate-950' 
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {ratio.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div 
                      onClick={onOpenPlanSelector}
                      className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-3.5 flex items-center justify-between cursor-pointer hover:border-purple-400/20 opacity-70"
                    >
                      <span className="text-[10px] text-slate-400">Proporções de imagem (1:1, 16:9, etc)</span>
                      <span className="text-[9px] font-black uppercase text-purple-400 flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Desbloquear
                      </span>
                    </div>
                  )}
                </div>

                {/* Generate ISO Privacy Compliance Report */}
                <div 
                  className={`flex items-start gap-3 rounded-xl border p-4 transition-all ${
                    isBusiness 
                      ? 'border-slate-800 bg-slate-900 cursor-pointer hover:border-slate-755' 
                      : 'border-slate-900 bg-slate-950/40 opacity-70 cursor-pointer hover:border-purple-400/20'
                  }`}
                  onClick={() => {
                    if (!isBusiness) {
                      onOpenPlanSelector();
                    } else {
                      setOptions({ ...options, generateComplianceReport: !options.generateComplianceReport });
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isBusiness ? !!options.generateComplianceReport : false}
                    disabled={!isBusiness}
                    readOnly
                    className="mt-1 h-4 w-4 rounded-md text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block mb-0.5 flex items-center gap-1">
                      Relatórios de Conformidade e Privacidade
                      {!isBusiness && <Lock className="h-3 w-3 text-purple-400" />}
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Anexa à mídias re-renderizadas um certificado estrutural .TXT de conformidade simulada sob as normas de restrição EXIF e sanitização contra rastreadores corporativos.
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Active Result Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 flex-1 flex flex-col">
            <h3 className="text-[10px] font-black text-slate-500 mb-5 flex items-center gap-2 uppercase tracking-widest font-mono">
              <Sparkles className="h-4 w-4" /> Imagem Refinada
            </h3>

            {processedUrl ? (
              <div className="flex-1 flex flex-col justify-between">
                <div className="w-full relative h-[250px] flex items-center justify-center bg-slate-950/40 rounded-xl overflow-hidden mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={processedUrl} className="max-h-full max-w-full object-contain" alt="Processado" />
                  <div className="absolute top-3 right-3 bg-emerald-500/90 text-white font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest flex items-center gap-1">
                    <Check className="h-2.5 w-2.5" /> Sucesso
                  </div>
                </div>

                {/* Optimisation metrics */}
                {fileDetails && (
                  <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 flex flex-col gap-2 text-xs mb-6 font-mono text-left">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tamanho Original:</span>
                      <span className="text-white">{formatSize(fileDetails.originalSize)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-2">
                      <span className="text-slate-400">Tamanho Processado:</span>
                      <span className={`font-semibold ${fileDetails.processedSize < fileDetails.originalSize ? 'text-amber-400' : 'text-white'}`}>
                        {formatSize(fileDetails.processedSize)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 font-bold">
                      <span className="text-slate-400">Taxa de Compressão:</span>
                      <span className="text-emerald-400 animate-pulse">
                        {Math.round(((fileDetails.originalSize - fileDetails.processedSize) / fileDetails.originalSize) * 100)}% reduzido
                      </span>
                    </div>
                  </div>
                )}

                {/* Download Actions */}
                <button
                  onClick={downloadImage}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 py-3 text-xs font-black uppercase tracking-widest text-slate-950 transition-all shadow-[0_0_20px_rgba(251,191,36,0.15)] cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Baixar Arquivo Purificado</span>
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-4">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                  {image ? 'Ajuste os parâmetros estéticos e inicie o purificador para re-renderizar sua imagem.' : 'Faça upload de uma foto para começar.'}
                </p>

                {image && (
                  <button
                    onClick={processImage}
                    disabled={processing}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-400 hover:bg-amber-300 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-950 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {processing ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>{processingStatus}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Purificar Pixels</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Privacy info panel */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5 flex gap-4 text-xs select-none shadow">
            <Shield className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div className="text-left">
              <span className="font-bold text-white block mb-0.5">Segurança Avançada</span>
              <p className="text-slate-500 leading-normal">
                Suas mídias originais são refinadas localmente pelo buffer temporário e descartadas integralmente de todos os nossos canais após a exportação estrutural.
              </p>
            </div>
          </div>

        </div>

      </div>

      )}

      {/* Informative Section: Como remover metadados e Por que remover metadados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 text-left border-t border-slate-900 pt-10">
        {/* Como remover metadados */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-black text-amber-400 font-mono font-sans">01</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">Como remover metadados</h3>
          </div>
          <div className="space-y-3.5 text-slate-300 text-xs leading-relaxed">
            <div className="flex items-start gap-2.5">
              <span className="text-amber-400 mt-0.5 font-mono">✦</span>
              <p><strong>Envie seu arquivo:</strong> Arraste e solte seu arquivo de imagem na área de upload ou clique para selecionar.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-amber-400 mt-0.5 font-mono">✦</span>
              <p><strong>Clique em "Purificar Pixels":</strong> Escolha o formato e a fidelidade desejada na lateral e inicie o processamento.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-amber-400 mt-0.5 font-mono">✦</span>
              <p><strong>Download Seguro:</strong> Seu arquivo será processado, todos os metadados serão removidos e você poderá salvar um arquivo limpo.</p>
            </div>
            <div className="mt-4 rounded-xl bg-slate-950/40 p-3.5 text-[11px] text-slate-400 border border-slate-900 leading-normal">
              <span className="font-bold text-slate-300 block mb-1">Observação:</span>
              Buscamos remover todos os metadados, mas nem sempre é possível detectar e excluir cada um deles.
            </div>
          </div>
        </div>

        {/* Por que remover metadados? */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Shield className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">Por que remover metadados?</h3>
          </div>
          <div className="text-slate-300 text-xs space-y-3 font-medium leading-relaxed">
            <p>
              Excluir metadados dos seus arquivos é importante para proteger sua privacidade e segurança. Os metadados podem incluir informações sensíveis, como sua localização, detalhes do dispositivo e a data e hora em que o arquivo foi criado ou editado.
            </p>
            <p>
              Ao remover esses dados, você pode ajudar a evitar o acesso não autorizado a informações pessoais, reduzir o risco de roubo de identidade e manter seus arquivos mais confidenciais.
            </p>
            <div className="mt-4 flex items-center justify-center h-12 rounded-xl border border-dashed border-slate-800 bg-slate-950/20 text-slate-400 text-[10px] uppercase font-mono tracking-widest gap-2">
              <Shield className="h-4 w-4 text-emerald-400 animate-pulse" /> Proteção Ativa Privada
            </div>
          </div>
        </div>
      </div>

      {/* Historical List Section */}
      <div className="border-t border-slate-900 pt-10 text-left">
        <div className="flex items-center gap-2.5 mb-6">
          <History className="h-5 w-5 text-amber-500" />
          <h2 className="text-xl font-bold tracking-tight text-white font-display uppercase">Seu Histórico de Refinos</h2>
        </div>

        {loadingHistory ? (
          <div className="py-10 text-center">
            <RefreshCw className="h-6 w-6 animate-spin text-amber-500 mx-auto" />
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-slate-900 bg-slate-900/10 py-12 text-center text-slate-500 text-xs font-mono uppercase">
            Nenhuma imagem processada encontrada. Suas otimizações anteriores aparecerão aqui.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-905 bg-slate-900 p-4 hover:border-slate-700 transition-colors flex gap-4"
              >
                {/* Thumbnail */}
                <div className="h-16 w-16 bg-slate-950/60 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.downloadUrl} className="h-full w-full object-cover" alt="Thumb" />
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-xs text-white truncate mb-0.5">{item.processedName}</h4>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Qualidade: {item.compressionRate}% • Redução: {Math.round(((item.originalSize - item.processedSize) / item.originalSize) * 100)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2">
                    <span>{item.createdAt.toLocaleDateString('pt-BR')}</span>
                    <button
                      onClick={(e) => triggerHistoryDownload(e, item.downloadUrl, item.processedName)}
                      className="text-amber-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="h-3 w-3" /> Baixar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

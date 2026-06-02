'use client';

import React, { useState, useRef, useEffect } from 'react';
import { db } from '@/src/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { ProcessedImage, ProcessingOptions, UserProfile } from '@/src/types';
import { Upload, Sliders, Shield, Zap, Sparkles, Image as ImageIcon, Download, Settings, History, Check, RefreshCw } from 'lucide-react';
import { getApiUrl } from '@/lib/api-client';

interface DashboardClientProps {
  userProfile: UserProfile;
  onRefreshProfile: () => void;
  onOpenPlanSelector: () => void;
}

export default function DashboardClient({ userProfile, onRefreshProfile, onOpenPlanSelector }: DashboardClientProps) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  const [options, setOptions] = useState<ProcessingOptions>({
    exifStripped: true,
    pixelJitter: true,
    grainApplied: true,
    grainIntensity: 25,
    compressionRate: 85,
    outputFormat: 'image/jpeg'
  });

  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{ originalSize: number; processedSize: number } | null>(null);
  const [history, setHistory] = useState<ProcessedImage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile.uid]);

  const handleFile = (file: File) => {
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
      formData.append('grainIntensity', String(options.grainIntensity));
      formData.append('compressionRate', String(options.compressionRate));
      formData.append('outputFormat', options.outputFormat);

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        
        {/* Upload & Control Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
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

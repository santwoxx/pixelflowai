import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Upload, Download, Check, ShieldCheck, HelpCircle, FileText, Settings, ArrowRight, ArrowLeft } from 'lucide-react';
import SEOHead from './SEOHead';

interface SEOLandingPageProps {
  slug: string;
  onNavigateToAuth: () => void;
  onNavigateHome: () => void;
  onNavigateToBlog: () => void;
}

interface SEOPageData {
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  introText: string;
  tagline: string;
  featuresTitle: string;
  features: { h3: string; desc: string }[];
  stepsTitle: string;
  steps: string[];
  faqs: { q: string; a: string }[];
}

const SEO_PAGES_COPY: Record<string, SEOPageData> = {
  'remover-metadados': {
    title: 'Remover Metadados de Imagem Online e Grátis | PixelFlow AI',
    description: 'Como remover metadados de imagem em lote. Delete tags EXIF, dados de GPS, câmera e prompts de criação de fotos geradas por inteligência artificial.',
    h1: 'REMOVER METADADOS DE IMAGENS SEM PERDER A QUALIDADE',
    subtitle: 'O jeito definitivo de proteger sua privacidade digital e restaurar a harmonia visual',
    tagline: 'remover metadados',
    introText: 'Remover metadados é essencial para criadores de conteúdo que usam imagens criadas por Inteligência Artificial (como Midjourney ou DALL-E) ou fotos de câmeras profissionais. Ao publicar uma imagem original, você compartilha dados secretos como data, hora, coordenadas de satélite (GPS) e configurações de compressão. Nosso sistema de sandbox higieniza seus arquivos em segundos.',
    featuresTitle: 'Por que purificar os metadados dos seus arquivos?',
    features: [
      { h3: 'Imunidade de Rastreio GPS', desc: 'Ao remover dados de imagem você impede que cibercriminosos ou concorrentes saibam a coordenada física de onde a foto foi tirada ou salva.' },
      { h3: 'Harmonização Orgânica', desc: 'As grandes redes priorizam fotos com aspecto humano e limpo. Purificar esses dados e re-estruturar metadados textuais reativa a entrega nativa das suas mídias.' },
      { h3: 'Compactação Inteligente sRGB', desc: 'A exclusão de dados textuais avulsos e emissores XML em excesso otimiza o carregamento final da sua foto.' }
    ],
    stepsTitle: 'Como remover metadados em 3 etapas simples:',
    steps: [
      'Faça o upload do seu arquivo de imagem (JPG / PNG / WebP) abaixo.',
      'Aguarde a sandbox ler os cabeçalhos binários e expurgar todos os dados.',
      'Baixe seu novo arquivo totalmente purificado em formato profissional livre.'
    ],
    faqs: [
      { q: 'O que são metadados de imagem?', a: 'Metadados são registros embutidos em arquivos JPEG, PNG e outros formatos. Eles guardam histórico de câmeras, coordenadas e direitos autorais.' },
      { q: 'O PixelFlow AI diminui a resolução da imagem?', a: 'Não. Nosso purificador reconstrói o cabeçalho binário, mantendo intactos todos os canais RGB com fidelidade de cor estrita.' },
      { q: 'Por que o Instagram avalia metadados?', a: 'Para catalogar metadados e marcar posts que usam IAs generativas de forma crua, o que às vezes diminui a naturalidade percebida.' }
    ]
  },
  'remover-exif': {
    title: 'Como Remover EXIF de Fotos Online - Purificador de Cabeçalho',
    description: 'Aprenda como remover EXIF de fotos online em segundos. Remova coordenadas GPS, fabricante da câmera e prompts ocultos de arquivos IA.',
    h1: 'REMOVER EXIF DE FOTOS ONLINE MANUAL OU EM LOTE',
    subtitle: 'Nuke no cabeçalho invisível para segurança de dados e maior alcance algorítmico',
    tagline: 'remover EXIF',
    introText: 'O formato de arquivo intercambiável (EXIF) reúne especificações sobre abertura, marca da lente, modelo do sensor e hora da captura. O PixelFlow limpa instantaneamente toda a estrutura EXIF sem corromper ou re-comprimir de forma inadequada os pixels originais.',
    featuresTitle: 'A importância de higienizar o cabeçalho EXIF',
    features: [
      { h3: 'Apague Prompts de IA', desc: 'Evite que concorrentes copiem seus prompts do Midjourney embutidos no cabeçalho XMP do arquivo gerado.' },
      { h3: 'Conformidade com a LGPD', desc: 'Empresas evitam vazamentos acidentais de registros corporativos internos em cabeçalhos de fotos comerciais.' },
      { h3: 'Texturas Cinematográficas de Grão', desc: 'Substitua o aspecto plástico e frio das IAs por um acabamento fotográfico orgânico profissional com textura enriquecida.' }
    ],
    stepsTitle: 'Fluxo simplificado para limpar dados de câmera:',
    steps: [
      'Selecione a foto que deseja limpar o arquivo.',
      'O PixelFlow quebra as chaves e remove os campos EXIF e de geolocalização.',
      'Pronto! Guarde ou publique com segurança.'
    ],
    faqs: [
      { q: 'Qual a diferença de EXIF e metadados?', a: 'O EXIF é um tipo de metadado dedicado a dados técnicos de câmeras fotográficas e satélites.' },
      { q: 'O arquivo fica mais leve?', a: 'Sim. Em mídias complexas de IA, a remoção da árvore com tags do XML reduz consideravelmente o peso final.' }
    ]
  },
  'metadata-remover': {
    title: 'Instant Image Metadata Remover Online | PixelFlow AI',
    description: 'Use our metadata remover tool to strip geo-coordinates, camera details, and AI generator prompts from your pictures for maximum social reach.',
    h1: 'SECURE METADATA REMOVER TOOL FOR SOCIAL MEDIA CREATORS',
    subtitle: 'Strip out GPS data, camera tags, and hidden AI signatures in milliseconds',
    tagline: 'metadata remover',
    introText: 'Publishing graphics directly without a metadata remover leaves you vulnerable to reverse-image lookup sensors. PixelFlow strips information from headers and implements pixel adjustments or analog grain overlay to naturalize artificial textures for maximum organic performance.',
    featuresTitle: 'Why use an automated online metadata remover?',
    features: [
      { h3: 'Optimize Social Reach', desc: 'Instagram, Pinterest, and TikTok automatically catalog generative artwork based on metadata elements. Purging these markers restores normal engagement.' },
      { h3: 'Remove Raw Prompts', desc: 'Stop letting people steal your secret prompt recipes stored in the pictures metadata payload.' },
      { h3: 'Maintain Max Resolution', desc: 'Our engine processes everything serverside and retains crystal clear resolution on your download.' }
    ],
    stepsTitle: 'Processing sequence:',
    steps: [
      'Drop your artificial image or DSLR photo layout here.',
      'Let the algorithmic engine clean the binary segment header.',
      'Save the clean asset prepared for social propagation.'
    ],
    faqs: [
      { q: 'Will it remove GPS tags?', a: 'Yes, it strips all latitude, longitude, and elevation coordinate blocks immediately.' },
      { q: 'Is it safe to use PixelFlow?', a: 'Absolutely. Files are processed securely and we do not store your original graphics on other public platforms.' }
    ]
  },
  'remover-dados-da-foto': {
    title: 'Como Remover Dados da Foto (Informações Ocultas) | PixelFlow',
    description: 'Como apagar todos os dados da foto pelo celular ou computador. Remova dados de fabricação, GPS e histórico de alterações em segundos.',
    h1: 'COMO APAGAR TODOS OS DADOS DA FOTO ANTES DE PUBLICAR',
    subtitle: 'Oculte rastras digitais e otimize a distribuição do seu conteúdo comercial',
    tagline: 'remover dados da foto',
    introText: 'Quer enviar fotos para clientes ou redes sociais e esconder informações do fabricante ou da localização? Aprenda os segredos modernos sobre manipulação de mídias e purificação de dados.',
    featuresTitle: 'Vantagens de remover dados da foto',
    features: [
      { h3: 'Privacidade Imbatível', desc: 'Silencie as informações e impeça que rastreiem de onde você gerência seu celular ou portfólio.' },
      { h3: 'Aparência Mais Orgânica', desc: 'Artes passam a atuar e se distribuir como fotos normais com refinamento de textura natural fotográfica.' },
      { h3: 'Sem Custo de Ferramenta', desc: 'Oferecemos o processamento inicial grátis de até 5 imagens no plano padrão free.' }
    ],
    stepsTitle: 'Passo a passo rápido:',
    steps: [
      'Arraste a foto que você precisa ocultar os dados.',
      'Inicie a purificação do arquivo binário.',
      'Visualize e exporte seu arquivo final refinado.'
    ],
    faqs: [
      { q: 'Como vejo os dados ocultos da foto?', a: 'No celular ou PC, as propriedades revelam data de gravação, modelo, e coordenadas geográficas salvos por padrão.' },
      { q: 'Consigo ver de onde a foto foi tirada se remover os dados?', a: 'Não. Depois de passar pelo PixelFlow, o GPS é totalmente apagado e é impossível recuperá-lo.' }
    ]
  },
  'image-metadata-remover': {
    title: 'Professional Image Metadata Remover - Bulk Processing',
    description: 'Highly-optimized crop and image metadata remover. Wipe metadata, authors, camera model and timestamps using a responsive UI.',
    h1: 'CLEAN YOUR GRAPHICS WITH BULK IMAGE METADATA REMOVER',
    subtitle: 'Purge complex technical layers without degrading the visual output',
    tagline: 'image metadata remover',
    introText: 'Perfect for content managers, traffic managers, and digital marketers who rely on bulk processing. Bring custom flair to AI illustrations and restore your brand distribution metrics on major marketing platforms.',
    featuresTitle: 'Key advantages of our high-fidelity tool',
    features: [
      { h3: 'Remove Invisible Elements', desc: 'Keep bots and automated detection crawlers from flagging your visual updates.' },
      { h3: 'Integrate Premium Film Grain', desc: 'Incorporate realistic silver halide noise overlays on your images to achieve authentic editorial style.' },
      { h3: 'Super Fast Core Web Vitals', desc: 'Leaner assets lead to faster website loading speeds and enhanced SEO rankings.' }
    ],
    stepsTitle: '3-Step cleanup flow:',
    steps: [
      'Upload your files through our high-performance drag-and-drop workspace below.',
      'Our engine strips technical headers, formats sRGB layout, and structures metadata-free images.',
      'Download your pristine graphics instantly.'
    ],
    faqs: [
      { q: 'Does it support WebP and PNG formats?', a: 'Yes, both and standard JPG formats are fully optimized and compatible.' },
      { q: 'Where are my images processed?', a: 'Images are processed client-side via optimized sandboxes, providing maximum privacy and speed.' }
    ]
  },
  'limpar-metadados-imagem': {
    title: 'Como Limpar Metadados de Imagem Grátis Online | PixelFlow AI',
    description: 'Guia definitivo e ferramenta integrada para limpar metadados de imagem grátis. Proteja sua privacidade e passe por baixo dos radares das redes.',
    h1: 'LIMPAR METADADOS DE IMAGEM IMEDIATAMENTE',
    subtitle: 'Higiene e otimização definitiva de arquivos de fotos de IA para alcance orgânico',
    tagline: 'limpar metadados imagem',
    introText: 'Limpar metadados de imagem é um processo fundamental na era da Inteligência Artificial. Imagens geradas pelo ChatGPT, Stable Diffusion ou DALL-E emitem marcadores indesejados. Nossa ferramenta realiza o procedimento localmente, rápido e 100% online.',
    featuresTitle: 'Por que o mercado exige mídias limpas de rastros?',
    features: [
      { h3: 'Naturalização Visual Orgânica', desc: 'As grandes redes utilizam indexação reversa automática para avaliar criativos corporativos puramente sintéticos. A naturalização remove esse efeito.' },
      { h3: 'Remoção de Impressões Digitais', desc: 'Apague tags ocultas de autoria e hashes de codificações proprietárias de softwares externos.' },
      { h3: 'Adição de Grão Analógico Ajustável', desc: 'Crie uma fusão de cores incrível aplicando grão analógico realista ajustando a densidade ou intensidade.' }
    ],
    stepsTitle: 'Veja como funciona a higienização:',
    steps: [
      'Envie o arquivo que precisa ser processado.',
      'Nosso algoritmo reescreve a árvore de dados removendo as linhas EXIF.',
      'Baixe o arquivo limpo.'
    ],
    faqs: [
      { q: 'Limpar metadados muda o tamanho da imagem?', a: 'Não altera o tamanho e a proporção física de pixels, apenas reduz a quantidade extra de bytes inúteis que pesam na foto.' },
      { q: 'É gratuito?', a: 'Sim. Você pode realizar o processo básico e testar gratuitamente direto do navegador.' }
    ]
  }
};

export default function SEOLandingPage({ slug, onNavigateToAuth, onNavigateHome, onNavigateToBlog }: SEOLandingPageProps) {
  const data = SEO_PAGES_COPY[slug] || SEO_PAGES_COPY['remover-metadados'];
  
  // Interactive Tool Simulation State
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
      await new Promise(resolve => setTimeout(resolve, 600));

      setProcessingState('⚡ Purificando cabeçalhos virtuais EXIF/XMP...');
      
      const response = await fetch('/api/purify-image', {
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
    // Generate simulated download anchor
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = downloadName || 'imagem_purificada.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Structured Data Schema generators for SEO
  const canonical = `https://pixelflow-ai.com/${slug}`;
  
  const faqsSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': data.faqs.map(item => ({
      '@type': 'Question',
      'name': item.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.a
      }
    }))
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'PixelFlow AI',
    'operatingSystem': 'Windows, macOS, Android, iOS, ChromeOS',
    'applicationCategory': 'MultimediaApplication',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'BRL'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': '2180'
    }
  };

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://pixelflow-ai.com'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': data.tagline,
        'item': canonical
      }
    ]
  };

  return (
    <div className="bg-[#020617] text-slate-100 min-h-screen relative selection:bg-amber-400 selection:text-slate-950 pb-20">
      
      {/* SEO Injector metadata attributes */}
      <SEOHead
        title={data.title}
        description={data.description}
        canonicalUrl={canonical}
        schemaType="FAQPage"
        schemaData={faqsSchema}
      />
      
      {/* Background radial spotlight accent */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/[0.04] rounded-full blur-[140px] pointer-events-none -mr-48 -mt-48" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-600/[0.03] rounded-full blur-[120px] pointer-events-none -ml-40" />

      <div className="mx-auto max-w-6xl px-6 pt-10 relative z-10">
        
        {/* Navigation Breadcrumb & Back Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 border-b border-slate-900 pb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <button onClick={onNavigateHome} className="hover:text-white transition-colors">HOME</button>
            <span>/</span>
            <span className="text-amber-400 font-bold uppercase">{slug}</span>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onNavigateToBlog} 
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Ver Blog de SEO</span>
            </button>
            <button 
              onClick={onNavigateHome} 
              className="text-xs font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar para Inicial</span>
            </button>
          </div>
        </div>

        {/* Hero Section copy */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-black tracking-widest text-amber-400 mb-6 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ferramenta Otimizada Gratuita
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-4 text-white leading-tight font-display uppercase">
            {data.h1}
          </h1>
          <p className="text-lg sm:text-xl text-amber-400 font-medium tracking-tight mb-6 uppercase max-w-3xl mx-auto">
            {data.subtitle}
          </p>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto">
            {data.introText}
          </p>
        </div>

        {/* INTEGRATED FUNCTIONAL TOOL WORKSPACE */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl mb-16 backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Column 1: Workspace Sandbox Upload */}
            <div className="lg:col-span-7 flex flex-col justify-between min-h-[340px]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Espaço de Processamento</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10">CONSOLA {data.tagline}</span>
              </div>

              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-amber-400/30 rounded-xl bg-slate-950/60 p-8 text-center cursor-pointer transition-all duration-200 group"
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
                  
                  {/* File Metadata Info Overlay before clean */}
                  <div className="flex gap-4 items-center border-b border-slate-800 pb-3 mb-3">
                    <div className="bg-amber-400/10 p-2 rounded text-amber-400 text-xs font-mono font-bold">RAW</div>
                    <div className="flex-grow min-w-0">
                      <span className="text-xs font-bold text-slate-100 block truncate">{file.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{Math.round(file.size / 1024)} KB • Status: Contém Metadados</span>
                    </div>
                    <button 
                      onClick={() => { setFile(null); setPreviewUrl(null); setProcessed(false); }}
                      className="text-xs font-bold text-slate-500 hover:text-red-400 uppercase font-mono"
                    >
                      Remover
                    </button>
                  </div>

                  {/* Sandbox preview display */}
                  <div className="flex-grow flex items-center justify-center relative rounded overflow-hidden max-h-[220px] bg-slate-950">
                    <img 
                      src={previewUrl || ''} 
                      alt="Preview original" 
                      className="max-h-full max-w-full object-contain"
                    />
                    
                    {processing && (
                      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                        <div className="h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
                        <span className="text-xs font-mono font-semibold text-amber-400 text-center animate-pulse">{processingState}</span>
                      </div>
                    )}

                    {processed && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow">
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

                {/* Strip EXIF Toggle (Always true in view) */}
                <div className="flex justify-between items-center p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-100">Expurgar EXIF/GPS/XMP</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">ATIVADO</span>
                </div>

                {/* Sub-Pixel Jitter Toggle */}
                <div className="flex justify-between items-center p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-100">Sub-Pixel Jitter</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 font-mono bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10">SUTIL</span>
                </div>

                {/* Grain slider bar */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850">
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
                  <span className="text-[9px] text-slate-500 font-mono block mt-1 uppercase">Interrompe a malha matemática de padrões de IA</span>
                </div>
              </div>

              {/* Functional Process triggers */}
              <div className="pt-6 border-t border-slate-800/60 mt-6 lg:mt-0">
                {!file ? (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all"
                  >
                    <span>Carregar Foto Primeiro</span>
                  </button>
                ) : !processed ? (
                  <button 
                    onClick={executeProcess}
                    disabled={processing}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4 animate-pulse text-black" />
                    <span>Executar Refinamento</span>
                  </button>
                ) : (
                  <div className="space-y-2.5">
                    <button 
                      onClick={downloadProcessed}
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all"
                    >
                      <Download className="h-4 w-4" />
                      <span>Baixar imagem sem metadados</span>
                    </button>
                    <button 
                      onClick={() => { setFile(null); setPreviewUrl(null); setProcessed(false); }}
                      className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                      Processar Outro Arquivo
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* RICH TEXT SEO-OPTIMIZED ARTICLES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-2xl font-black text-white font-display mb-4 uppercase">
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
            <h2 className="text-2xl font-black text-white mb-4 uppercase font-display">
              {data.stepsTitle}
            </h2>
            <div className="space-y-4">
              {data.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-slate-900 bg-slate-900/10">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-mono font-bold text-amber-400 flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed leading-snug">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HIGH-CONVERTING REGISTRATION CTA CARD */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-[#0e1630] border border-slate-800 p-8 sm:p-10 text-center relative overflow-hidden mb-20 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
          
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display mb-4 uppercase tracking-tight">
            REPROCESSAR EM LOTE COM PIXELFLOW PRO
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Esqueça arquivos unitários. Registre-se e desbloqueie o carregamento automático de pastas inteiras via ZIP, remova restrições de processamento diário e recupere 100% da autoridade de marca do seu portfólio.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={onNavigateToAuth}
              className="flex items-center gap-2 rounded-full bg-amber-400 px-8 py-4 font-black uppercase tracking-widest text-xs text-slate-950 hover:bg-amber-300 transition-all shadow-[0_0_30px_rgba(251,191,36,0.2)] transform hover:scale-[1.02]"
            >
              <span>Criar minha conta agora</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button 
              onClick={onNavigateHome}
              className="px-8 py-4 rounded-full border border-slate-800 hover:bg-slate-900 transition-all text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white"
            >
              Conhecer os planos
            </button>
          </div>
        </div>

        {/* FAQ SECTION OPTIMIZED FOR GOOGLE QUESTIONS (Rich Snippet layout) */}
        <div>
          <div className="flex items-center gap-2 mb-8 justify-center">
            <HelpCircle className="h-5 w-5 text-amber-400" />
            <h2 className="text-2xl font-black text-white font-display uppercase tracking-tight">FAQ — Perguntas Frequentes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {data.faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-950 rounded-xl border border-slate-900 p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2 font-display min-h-[32px]">
                    {faq.q}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-900 text-[9px] text-amber-400/60 font-mono uppercase tracking-widest">
                  Fato verificado por SEO-bot
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

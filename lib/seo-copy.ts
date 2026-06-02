export interface SEOPageData {
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

export const SEO_PAGES_COPY: Record<string, SEOPageData> = {
  'remover-metadados': {
    title: 'Remover Metadados de Imagem Online e Grátis | PixelFlow AI',
    description: 'Como remover metadados de imagem em lote. Delete tags EXIF, dados de GPS, câmera e marcas de criação de fotos geradas por inteligência artificial.',
    h1: 'REMOVER METADADOS DE IMAGENS SEM PERDER A QUALIDADE',
    subtitle: 'O jeito definitivo de proteger sua privacidade digital e restaurar a harmonia visual',
    tagline: 'remover metadados',
    introText: 'Remover metadados é essencial para criadores de conteúdo que usam imagens criadas por Inteligência Artificial (como Midjourney ou DALL-E) ou fotos de câmeras profissionais. Ao publicar uma imagem original, você compartilha dados adicionais como data, hora, coordenadas de satélite (GPS) e configurações de compressão. Nosso sistema higieniza seus arquivos em segundos.',
    featuresTitle: 'Por que purificar os metadados dos seus arquivos?',
    features: [
      { h3: 'Privacidade de Rastreio GPS', desc: 'Ao remover dados de imagem você impede que saibam a coordenada física de onde a foto foi tirada ou salva.' },
      { h3: 'Harmonização de Canal', desc: 'As grandes redes priorizam fotos com aspecto humano e limpo. Purificar esses dados e re-estruturar metadados textuais otimiza a aparência da mídia.' },
      { h3: 'Compactação sRGB Otimizada', desc: 'A exclusão de dados textuais avulsos e emissores XML em excesso diminui consideravelmente o carregamento final da sua foto.' }
    ],
    stepsTitle: 'Como remover metadados em 3 etapas simples:',
    steps: [
      'Faça o upload do seu arquivo de imagem (JPG / PNG / WebP) abaixo.',
      'Aguarde o processador ler os cabeçalhos binários e expurgar todos os dados.',
      'Baixe seu novo arquivo totalmente purificado em formato profissional livre.'
    ],
    faqs: [
      { q: 'O que são metadados de imagem?', a: 'Metadados são registros embutidos em arquivos JPEG, PNG e outros formatos. Eles guardam histórico de câmeras, coordenadas e direitos autorais.' },
      { q: 'O PixelFlow AI diminui a resolução da imagem?', a: 'Não. Nosso purificador reconstrói o cabeçalho binário, mantendo intactos todos os canais RGB com fidelidade de cor estrita.' },
      { q: 'Por que avaliar metadados de mídias?', a: 'Metadados são catalogados por redes de mídia para avaliar naturalidade e dar a distribuição correta.' }
    ]
  },
  'remover-exif': {
    title: 'Como Remover EXIF de Fotos Online - Purificador de Cabeçalho',
    description: 'Aprenda como remover EXIF de fotos online em segundos. Remova coordenadas GPS, fabricante da câmera e prompts ocultos de arquivos digitais.',
    h1: 'REMOVER EXIF DE FOTOS ONLINE MANUAL OU EM LOTE',
    subtitle: 'Limpeza de cabeçalho invisível para segurança de dados corporativos e alcance comercial',
    tagline: 'remover EXIF',
    introText: 'O formato de arquivo intercambiável (EXIF) reúne especificações sobre abertura, marca da lente, modelo do sensor e hora da captura. O PixelFlow limpa instantaneamente toda a estrutura EXIF sem corromper ou re-comprimir de forma inadequada os pixels originais.',
    featuresTitle: 'A importância de higienizar o cabeçalho EXIF',
    features: [
      { h3: 'Apague Metadados Técnicos', desc: 'Evite que concorrentes copiem seus parâmetros técnicos embutidos no cabeçalho XMP do arquivo final.' },
      { h3: 'Conformidade Corporativa', desc: 'Sua marca evita vazamentos acidentais de registros de geolocalização internos em cabeçalhos de fotos comerciais.' },
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
    description: 'Use our metadata remover tool to strip geo-coordinates, camera details, and tags from your pictures for maximum social reach.',
    h1: 'SECURE METADATA REMOVER TOOL FOR SOCIAL MEDIA CREATORS',
    subtitle: 'Strip out GPS data, camera tags, and metadata signatures in milliseconds',
    tagline: 'metadata remover',
    introText: 'Publishing graphics directly without a metadata remover leaves you vulnerable to reverse-image lookup sensors. PixelFlow strips information from headers and implements pixel adjustments or analog grain overlay to naturalize artificial textures for maximum organic performance.',
    featuresTitle: 'Why use an automated online metadata remover?',
    features: [
      { h3: 'Optimize Social Reach', desc: 'Instagram, Pinterest, and TikTok automatically catalog generative artwork based on metadata elements. Purging these markers restores normal engagement.' },
      { h3: 'Remove Raw Parameters', desc: 'Stop letting people steal your secret edit recipes stored in the pictures metadata payload.' },
      { h3: 'Maintain Max Resolution', desc: 'Our engine processes everything serverside and retains crystal clear resolution on your download.' }
    ],
    stepsTitle: 'Processing sequence:',
    steps: [
      'Drop your image or digital asset here.',
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
    subtitle: 'Oculte dados digitais e otimize a distribuição do seu conteúdo comercial',
    tagline: 'remover dados da foto',
    introText: 'Quer enviar fotos para clientes ou redes sociais e ocultar informações do fabricante ou da localização? Aprenda os segredos modernos sobre manipulação de mídias e purificação de dados.',
    featuresTitle: 'Vantagens de remover dados da foto',
    features: [
      { h3: 'Privacidade Imbatível', desc: 'Silencie as informações e impeça que saibam de onde você gerencia seu celular ou portfólio.' },
      { h3: 'Aparência Mais Orgânica', desc: 'Artes passam a atuar e se distribuir como fotos normais com refinamento de textura natural fotográfica.' },
      { h3: 'Sem Custeio Extra', desc: 'Oferecemos o processamento inicial de forma justa de até 5 imagens no plano free.' }
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
    introText: 'Perfect for content managers, traffic managers, and digital marketers who rely on bulk processing. Bring custom flair to digital illustrations and restore your brand distribution metrics on major marketing platforms.',
    featuresTitle: 'Key advantages of our high-fidelity tool',
    features: [
      { h3: 'Remove Invisible Elements', desc: 'Keep automated crawler software from flagging your visual updates.' },
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
      { q: 'Where are my images processed?', a: 'Images are processed securely on high-speed servers, providing maximum privacy.' }
    ]
  },
  'limpar-metadados-imagem': {
    title: 'Como Limpar Metadados de Imagem Grátis Online | PixelFlow AI',
    description: 'Guia definitivo e ferramenta integrada para limpar metadados de imagem grátis. Proteja sua privacidade de forma ideal.',
    h1: 'LIMPAR METADADOS DE IMAGEM IMEDIATAMENTE',
    subtitle: 'Higiene e otimização definitiva de arquivos de fotos de IA para alcance orgânico',
    tagline: 'limpar metadados imagem',
    introText: 'Limpar metadados de imagem é um processo fundamental na era da Inteligência Artificial. Imagens geradas pelo ChatGPT ou DALL-E emitem marcadores indesejados. Nossa ferramenta realiza o procedimento localmente, rápido e direto da web.',
    featuresTitle: 'Por que o mercado exige mídias limpas de rastros?',
    features: [
      { h3: 'Naturalização Visual Orgânica', desc: 'As grandes redes utilizam indexação reversa automática para avaliar criativos corporativos. A naturalização remove esse efeito.' },
      { h3: 'Remoção de Impressões Digitais', desc: 'Apague tags ocultas de autoria e hashes de codificações proprietárias de softwares externos.' },
      { h3: 'Adição de Grão Analógico Ajustável', desc: 'Crie uma fusão de cores incrível aplicando grão analógico realista ajustando a densidade ou intensidade.' }
    ],
    stepsTitle: 'Veja como funciona a higienização:',
    steps: [
      'Envie o arquivo que precisa ser processado.',
      'Nosso algoritmo reescreve a árvore de dados removendo as linhas EXIF.',
      'Baixe o arquivo de imagem limpo.'
    ],
    faqs: [
      { q: 'Limpar metadados muda o tamanho da imagem?', a: 'Não altera o tamanho e a proporção física de pixels, apenas reduz a quantidade extra de bytes que pesam na foto.' },
      { q: 'É gratuito?', a: 'Sim. Você pode realizar o processo básico e testar gratuitamente direto do navegador.' }
    ]
  }
};

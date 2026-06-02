import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pixelflow.ai';
  
  const routes = [
    '',
    '/remover-metadados',
    '/remover-exif',
    '/metadata-remover',
    '/remover-dados-da-foto',
    '/image-metadata-remover',
    '/limpar-metadados-imagem',
    '/blog',
    '/blog/como-remover-metadados-de-imagens',
    '/blog/instagram-detecta-imagens-ia',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}

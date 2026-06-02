import { notFound } from 'next/navigation';
import { SEO_PAGES_COPY } from '@/lib/seo-copy';
import SEOLandingClient from '@/components/SEOLandingClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return [
    { slug: 'remover-metadados' },
    { slug: 'remover-exif' },
    { slug: 'metadata-remover' },
    { slug: 'remover-dados-da-foto' },
    { slug: 'image-metadata-remover' },
    { slug: 'limpar-metadados-imagem' },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = SEO_PAGES_COPY[slug];

  if (!data) {
    return {
      title: 'Não Encontrado | PixelFlow AI',
    };
  }

  return {
    title: data.title,
    description: data.description,
    keywords: [data.tagline, 'remover metadados', 'limpar exif', 'otimizar imagem'],
    alternates: {
      canonical: `https://pixelflow.ai/${slug}`,
    },
    openGraph: {
      title: data.title,
      description: data.description,
      url: `https://pixelflow.ai/${slug}`,
      type: 'website',
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = SEO_PAGES_COPY[slug];

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-50">
      <Header />
      <main className="flex-grow">
        <SEOLandingClient slug={slug} data={data} />
      </main>
      <Footer />
    </div>
  );
}

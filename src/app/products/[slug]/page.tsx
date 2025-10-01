
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/data';
import { ProductDetailPageClient } from './product-detail-client';

export default async function Page({ params }: { params: { slug: string }}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug as string);

  if (!product) {
    notFound();
  }

  return <ProductDetailPageClient product={product} />;
}

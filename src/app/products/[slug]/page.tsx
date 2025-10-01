
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/data';
import { ProductDetailPageClient } from './product-detail-client';

export default function Page({ params }: { params: { slug: string }}) {
  const product = getProductBySlug(params.slug as string);

  if (!product) {
    notFound();
  }

  return <ProductDetailPageClient product={product} />;
}

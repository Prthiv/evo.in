import { HeroSection } from "@/components/hero-section";
import { Categories } from "@/components/categories";
import { MegaDeals } from "@/components/mega-deals";
import { TrendingPosters } from "@/components/trending-posters";
import { ReelsShowcase } from "@/components/reels-showcase";
import { FooterCTA } from "@/components/footer-cta";
import { Testimonials } from "@/components/testimonials";
import { CuratedBundles } from "@/components/curated-bundles";
import { getAllProducts, getVisibleCategories, getActiveCuratedBundles } from "@/lib/data-async";
import { getHomepageSettings } from "@/lib/settings-async";
import type { HeroSettings, MegaDealSettings } from "@/lib/types";
import { Suspense } from "react";

export default async function HomePage() {
  const products = await getAllProducts();
  const categories = await getVisibleCategories();
  const bundles = await getActiveCuratedBundles();
  
  const heroData = await getHomepageSettings<HeroSettings>('hero', {
    headline: 'Art That Defines You',
    subheadline: 'From iconic movie scenes to breathtaking landscapes, find the perfect high-quality posters and frames to express your style.',
    videoUrl: '/snapsave-app_3722314188888151940.mp4'
  });
  
  const megaDeals = await getHomepageSettings<MegaDealSettings[]>('megaDeals', []);
  const reels = await getHomepageSettings<any[]>('reels', []);
  
  // Get trending products (products marked as trending)
  const trendingProducts = products.filter(product => product.isTrending);

  return (
    <div className="min-h-screen">
      <HeroSection settings={heroData} />
      <Suspense fallback={<div>Loading categories...</div>}>
        <Categories categories={categories} />
      </Suspense>
      <MegaDeals settings={megaDeals} />
      <CuratedBundles products={products} bundles={bundles} />
      <TrendingPosters trendingProducts={trendingProducts} />
      <ReelsShowcase reels={reels} />
      <Testimonials />
      <FooterCTA />
    </div>
  );
}
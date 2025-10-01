
import { HeroSection } from "@/components/hero-section";
import { Categories } from "@/components/categories";
import { Testimonials } from "@/components/testimonials";
import { ScrollAnimator } from "@/components/scroll-animator";
import { MegaDeals } from "@/components/mega-deals";
import { TrendingPosters } from "@/components/trending-posters";
import { FramesUpsell } from "@/components/frames-upsell";
import { FooterCTA } from "@/components/footer-cta";
import { Footer } from "@/components/layout/footer";
import { ReelsShowcase } from "@/components/reels-showcase";
import { getAllProducts } from "@/lib/data";
import { getHomepageSettings } from "@/lib/settings";
import type { HeroSettings, MegaDealSettings } from "@/lib/types";

export default async function Home() {
  const allProducts = getAllProducts();
  const trendingProducts = allProducts.filter(p => p.isTrending);

  const heroSettings = await getHomepageSettings<HeroSettings>('hero', {
    headline: 'Art That Defines You',
    subheadline: 'From iconic movie scenes to breathtaking landscapes, find the perfect high-quality posters and frames to express your style.',
    videoUrl: '/snapsave-app_3722314188888151940.mp4'
  });

  const megaDealsSettings = await getHomepageSettings<MegaDealSettings[]>('megaDeals', []);
  const reels = await getHomepageSettings<any[]>('reels', []);


  return (
    <div className="flex flex-col space-y-16 md:space-y-24">
      <HeroSection settings={heroSettings} />
      
      <ScrollAnimator>
        <MegaDeals settings={megaDealsSettings} />
      </ScrollAnimator>

      <ScrollAnimator>
        <Categories />
      </ScrollAnimator>
      
      <ScrollAnimator>
        <TrendingPosters trendingProducts={trendingProducts} />
      </ScrollAnimator>

      <ScrollAnimator>
        <FramesUpsell />
      </ScrollAnimator>
      
      <ScrollAnimator>
        <Testimonials />
      </ScrollAnimator>

      <ScrollAnimator>
        <ReelsShowcase reels={reels} />
      </ScrollAnimator>

      <FooterCTA />
      <Footer />
    </div>
  );
}

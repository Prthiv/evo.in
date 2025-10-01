
import { getAllProducts } from "@/lib/data";
import { getHomepageSettings } from "@/lib/settings";
import { StudioHomepageClient } from "@/components/admin/studio-homepage-client";
import type { HeroSettings, MegaDealSettings } from "@/lib/types";

export default async function StudioHomepagePage() {
    const products = getAllProducts();
    
    const heroData = await getHomepageSettings<HeroSettings>('hero', {
        headline: 'Art That Defines You',
        subheadline: 'From iconic movie scenes to breathtaking landscapes, find the perfect high-quality posters and frames to express your style.',
        videoUrl: '/snapsave-app_3722314188888151940.mp4'
    });
    
    const megaDeals = await getHomepageSettings<MegaDealSettings[]>('megaDeals', []);

    // For reels, we'll manage them in the settings DB as well.
    const reels = await getHomepageSettings<any[]>('reels', []);


  return (
    <StudioHomepageClient
        products={products}
        heroData={heroData}
        megaDeals={megaDeals}
        reels={reels}
    />
  );
}

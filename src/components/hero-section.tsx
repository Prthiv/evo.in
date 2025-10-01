
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { HeroSettings } from '@/lib/types';

export function HeroSection({ settings }: { settings: HeroSettings }) {

  return (
    <section className="relative w-full overflow-hidden bg-secondary">
      <div className="relative flex h-[60vh] w-full items-center justify-center text-center text-foreground md:h-[70vh] group">
        <div className="absolute inset-0 overflow-hidden z-0">
          <video
            key={settings.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-50"
          >
            <source src={settings.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {settings.headline}
          </h1>
          <p className="font-body mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {settings.subheadline}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild className="text-lg">
              <Link href="/products">
                Shop All Posters
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg">
              <Link href="/#mega-deals">
                View Bundle Deals
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

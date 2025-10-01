
'use client';

import { Card, CardContent } from '@/components/ui/card';

export function ReelsShowcase({ reels }: { reels: any[] }) {
  if (!reels || reels.length === 0) {
    return null;
  }

  const duplicatedReels = [...reels, ...reels];

  return (
    <section className="py-16 md:py-24">
      <div className="mb-12 text-center">
        <h2 className="font-headline text-3xl font-bold sm:text-4xl">
          Community Showcase
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Get inspired by how others have styled their Evo.in posters.
        </p>
      </div>

      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {duplicatedReels.map((reel, index) => (
             <div
              key={`${reel.id}-${index}`}
              className="w-[200px] md:w-[250px] shrink-0 px-2 group"
            >
              <Card className="overflow-hidden rounded-xl">
                <CardContent className="p-0">
                  <div className="relative aspect-[9/16] perspective-1000">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      poster={reel.poster}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 preserve-3d"
                    >
                      <source src={reel.src} type="video/mp4" />
                    </video>
                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <h3 className="text-white font-bold font-headline text-lg drop-shadow-md">
                        {reel.title}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

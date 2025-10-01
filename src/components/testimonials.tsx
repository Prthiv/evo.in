'use client';

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Jessica M.',
    quote:
      "The quality of these posters is insane! My JDM bundle looks amazing on my wall. The colors are so vibrant and the paper feels premium. Will definitely be back for more.",
    avatarId: 'avatar1',
    rating: 5,
  },
  {
    id: 2,
    name: 'David L.',
    quote:
      "I'm a huge anime fan, and finding high-quality art is tough. Evo Artistry nailed it. The Titan Slayer is the centerpiece of my collection now. 10/10.",
    avatarId: 'avatar2',
    rating: 5,
  },
  {
    id: 3,
    name: 'Sophie R.',
    quote:
      'My boyfriend is obsessed with his superhero posters. The bundle deal was a steal, and the quality is way better than I expected. The frames are solid and easy to hang too.',
    avatarId: 'avatar3',
    rating: 5,
  },
    {
    id: 4,
    name: 'Mark C.',
    quote:
      "Customer service was super helpful when I had a question about shipping. The posters arrived quickly and were well-packaged. Great experience all around.",
    avatarId: 'avatar4',
    rating: 5,
  },
  {
    id: 5,
    name: 'Chloe T.',
    quote:
      "The curated bundles are such a good idea! I got the JDM Legends pack and it completely transformed my office space. It's like an instant gallery wall.",
    avatarId: 'avatar1',
    rating: 5,
  },
  {
    id: 6,
    name: 'Alex B.',
    quote:
      "I'm impressed with the custom frame option. I uploaded a photo from my last trip and it turned out beautifully. The quality is top-notch and it arrived faster than I thought.",
    avatarId: 'avatar2',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="container py-16 md:py-24">
      <div className="mb-12 text-center">
        <h2 className="font-headline text-3xl font-bold sm:text-4xl">
          From Our Customers
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          See what our community of art lovers is saying about their hauls.
        </p>
      </div>

      <Carousel
        plugins={[
          Autoplay({
            delay: 4000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {testimonials.map(testimonial => {
            const avatarImage = PlaceHolderImages.find(
              img => img.id === testimonial.avatarId
            );
            return (
              <CarouselItem
                key={testimonial.id}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <div className="p-4">
                  <Card className="h-full transition-all duration-500 ease-in-out hover:shadow-xl hover:-translate-y-2">
                    <CardContent className="flex h-full flex-col justify-between p-6">
                      <div>
                        <div className="flex items-center gap-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                            ))}
                        </div>
                        <p className="font-body mt-4 text-muted-foreground">
                          "{testimonial.quote}"
                        </p>
                      </div>
                      <div className="mt-6 flex items-center gap-4">
                        {avatarImage && (
                          <Image
                            src={avatarImage.imageUrl}
                            alt={testimonial.name}
                            data-ai-hint={avatarImage.imageHint}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-headline font-semibold">
                            {testimonial.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Verified Buyer
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

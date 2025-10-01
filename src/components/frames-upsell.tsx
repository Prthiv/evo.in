
'use client'

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FramesUpsell() {
    // const image = PlaceHolderImages.find(i => i.id === 'frames-upsell');
    const imageUrl = '/uploads/Screenshot 2025-10-01 210229.png';
    const imageAlt = 'Custom Frames Upsell';

    return (
        <section className="bg-secondary/50">
            <div className="container grid md:grid-cols-2 gap-12 items-center py-16 md:py-24">
                <div className="text-center md:text-left">
                    <span className="text-sm text-primary font-bold uppercase tracking-widest">Upgrade Your Look</span>
                    <h2 className="text-3xl md:text-4xl font-bold font-headline mt-4">Add a Premium Frame</h2>
                    <p className="text-lg text-muted-foreground mt-4">
                        Protect your art and give it a gallery-quality finish with our premium frames. Available in multiple finishes to perfectly match your style.
                    </p>
                    <div className="mt-6 space-y-2 font-headline text-xl">
                        <p>A4 Frame &rarr; <span className="font-bold">₹377/-</span></p>
                        <p>A3 Frame &rarr; <span className="font-bold">₹477/-</span></p>
                    </div>
                     <Button asChild size="lg" className="mt-8">
                        <Link href="/products?category=CUSTOM%20FRAMES">
                            Explore Frames
                            <ArrowRight className="ml-2"/>
                        </Link>
                    </Button>
                </div>
                <div className="relative aspect-square">
                    {imageUrl && (
                        <Image 
                            src={imageUrl}
                            alt={imageAlt}
                            fill
                            className="object-cover rounded-lg shadow-xl"
                        />
                    )}
                </div>
            </div>
        </section>
    )
}

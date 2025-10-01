
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import type { MegaDealSettings } from "@/lib/types";

export function MegaDeals({ settings }: { settings: MegaDealSettings[] }) {

    const activeDeals = settings.filter(deal => deal.active);

    if (activeDeals.length === 0) {
        return null;
    }

    return (
        <section id="mega-deals" className="container">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold font-headline sm:text-4xl">Mega Bundle Offers</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    The more you buy, the more you save. Perfect for home décor, gifting & collectors!
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {activeDeals.map((deal) => (
                    <Card key={deal.buy} className="text-center group card-glow border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-2xl font-headline">Buy {deal.buy}, Get {deal.get} FREE</CardTitle>
                            <CardDescription className="text-lg font-bold text-primary">Get a total of {deal.total} posters!</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button asChild size="lg" className="w-full button-glow">
                                <Link href="/products">
                                    <ShoppingBag className="mr-2 h-5 w-5"/>
                                    Start Building
                                    <ArrowRight className="ml-2 h-5 w-5 transform transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

        </section>
    )
}

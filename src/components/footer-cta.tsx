
import { Logo } from "./icons";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";


export function FooterCTA() {
    return (
        <section className="container py-16 md:py-24 text-center">
            <Logo className="mx-auto h-12 w-auto"/>
            <h2 className="text-3xl md:text-4xl font-bold font-headline mt-6">Ready to Find Your Perfect Poster?</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
                Browse our collection and start building your custom bundle today.
            </p>
            <Button asChild size="lg" className="mt-8 text-lg">
                <Link href="/products">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5"/>
                </Link>
            </Button>
        </section>
    )
}

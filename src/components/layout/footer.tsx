import Link from 'next/link';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { Logo } from '@/components/icons';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95">
      <div className="container grid grid-cols-1 gap-8 py-12 text-center md:grid-cols-4 md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="mb-4">
            <Logo />
          </Link>
          <p className="max-w-xs font-body text-sm text-muted-foreground">
            Curated posters and frames for the modern enthusiast.
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <h4 className="font-headline text-lg font-medium">Shop</h4>
          <Link href="/products?category=CAR+FRAMES+AND+WALL+POSTERS" className="font-body text-sm text-muted-foreground hover:text-primary">Car Posters</Link>
          <Link href="/products?category=ANIME+FRAMES+AND+WALLPOSTERS" className="font-body text-sm text-muted-foreground hover:text-primary">Anime Posters</Link>
          <Link href="/products?category=SUPERHERO+FRAMES+AND+POSTERS" className="font-body text-sm text-muted-foreground hover:text-primary">Superhero Posters</Link>
          <Link href="/products" className="font-body text-sm text-muted-foreground hover:text-primary">All Products</Link>
        </div>

        <div className="flex flex-col space-y-3">
          <h4 className="font-headline text-lg font-medium">Support</h4>
          <Link href="#" className="font-body text-sm text-muted-foreground hover:text-primary">Contact Us</Link>
          <Link href="#" className="font-body text-sm text-muted-foreground hover:text-primary">FAQ</Link>
          <Link href="/order-lookup" className="font-body text-sm text-muted-foreground hover:text-primary">Order Lookup</Link>
          <Link href="#" className="font-body text-sm text-muted-foreground hover:text-primary">Shipping & Returns</Link>
        </div>

        <div className="flex flex-col space-y-3">
          <h4 className="font-headline text-lg font-medium">Follow Us</h4>
          <div className="flex justify-center space-x-4 md:justify-start">
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Instagram className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/40 py-6">
        <div className="container flex flex-col items-center justify-between md:flex-row">
          <p className="font-body text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Evo.in. All rights reserved.
          </p>
          <div className="mt-4 flex space-x-4 md:mt-0">
            <Link href="#" className="font-body text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
            <Link href="#" className="font-body text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

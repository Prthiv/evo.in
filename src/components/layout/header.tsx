'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, X, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import React from 'react';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/products', label: 'All Products' },
  { href: '/#categories', label: 'Categories'},
  { href: '/custom', label: 'Custom' },
];

function SearchDialog() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.length > 1) {
      setLoading(true);
      const timer = setTimeout(async () => {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
        setLoading(false);
      }, 300); // Debounce search
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) handleClose();
        setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Search Products</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posters, categories, tags..."
              className="pl-10 h-11 text-base"
            />
            {query && (
              <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setQuery('')}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
        
        {loading && <div className="p-6 flex justify-center items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Searching...</div>}

        {!loading && query.length > 1 && results.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">No products found for "{query}".</div>
        )}
        
        {!loading && results.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto px-6 pb-6 space-y-4">
            {results.map((product, index) => (
              <React.Fragment key={product.id}>
                <Link href={`/products/${product.slug}`} onClick={handleClose} className="flex items-center gap-4 group hover:bg-accent p-2 rounded-md">
                    <Image 
                        src={product.images[0]?.url || ''}
                        alt={product.name}
                        width={64}
                        height={96}
                        className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                        <p className="font-headline font-semibold group-hover:text-primary">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category.replace(/ FRAMES AND WALLPOSTERS| FRAMES AND POSTERS/g, "")}</p>
                        <p className="font-semibold mt-1">₹{product.price.toFixed(2)}</p>
                    </div>
                </Link>
                {index < results.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function Header() {
  const pathname = usePathname();
  const { itemsCount } = useCart();
  const isMobile = useIsMobile();
  const [isMenuOpen, setMenuOpen] = useState(false);

  // Hide header in studio area
  if (pathname?.startsWith('/studio')) {
    return null;
  }

  const navContent = (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setMenuOpen(false)}
          className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navContent}
          </nav>
        </div>

        {isMobile && (
          <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
               <Link href="/" className="mb-8 flex items-center" onClick={() => setMenuOpen(false)}>
                <Logo />
              </Link>
              <nav className="flex flex-col space-y-6">
                {navContent}
              </nav>
              <SheetTitle className="sr-only">Menu</SheetTitle>
            </SheetContent>
          </Sheet>
        )}
        
        <div className={cn("flex flex-1 items-center justify-end space-x-2", isMobile && "justify-center")}>
           {!isMobile && (
            <div className="flex-1" />
           )}
            {isMobile && (
                 <Link href="/" className="flex items-center" onClick={() => setMenuOpen(false)}>
                  <Logo />
                </Link>
            )}

          <div className="flex items-center space-x-1">
            <SearchDialog />
            <Button variant="ghost" size="icon" asChild>
                <Link href="/order-lookup">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Account</span>
                </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {itemsCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {itemsCount}
                  </span>
                )}
                <span className="sr-only">Shopping Cart</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
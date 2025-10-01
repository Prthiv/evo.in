
import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/hooks/use-cart.tsx';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Inter, Poppins } from 'next/font/google';
import { SelectionProvider } from '@/hooks/use-selection.tsx';
import { Footer } from '@/components/layout/footer';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontSerif = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-serif',
});


export const metadata: Metadata = {
  title: 'Evo.in',
  description: 'Curated posters and frames for the modern enthusiast.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontSerif.variable
        )}
      >
        <CartProvider>
          <SelectionProvider>
            <div className="relative flex min-h-dvh flex-col bg-background">
              <Header />
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
          </SelectionProvider>
        </CartProvider>
      </body>
    </html>
  );
}

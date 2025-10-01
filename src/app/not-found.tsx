import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-6xl font-bold font-headline">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
      <p className="text-muted-foreground mt-2">Could not find the requested resource</p>
      <Link href="/" className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
        Return Home
      </Link>
    </div>
  );
}
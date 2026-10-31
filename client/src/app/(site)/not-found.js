import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-site grid min-h-[60vh] place-items-center py-24 text-center">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary"><SearchX className="h-8 w-8" /></span>
        <h1 className="mt-6 text-3xl font-extrabold">Page not found</h1>
        <p className="mt-2 text-slate-500">The page you’re looking for doesn’t exist or was moved.</p>
        <Link href="/" className="btn-primary mt-8">Back to home</Link>
      </div>
    </div>
  );
}

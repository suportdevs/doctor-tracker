import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <p className="font-heading text-6xl font-extrabold text-teal-600">404</p>
        <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700">Back to home</Link>
      </div>
    </main>
  );
}

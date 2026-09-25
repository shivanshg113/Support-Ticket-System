import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-widest mb-2">404</p>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Page not found</h1>
        <p className="text-[13px] text-gray-400 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="text-[13px] text-indigo-600 hover:text-indigo-700 font-medium">
          ← Back to tickets
        </Link>
      </div>
    </div>
  );
}

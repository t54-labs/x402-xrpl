import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl font-light text-cyan-400">404</span>
      </div>
      <h1 className="text-xl font-light text-white mb-3">Not Found</h1>
      <p className="text-sm text-gray-500 mb-6">The page, address, or transaction you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white hover:border-white/20 transition-all"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

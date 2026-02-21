export default function TxLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8 animate-pulse">
      <div className="h-4 bg-white/5 rounded w-32" />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/5" />
        <div>
          <div className="h-6 bg-white/5 rounded w-48" />
          <div className="h-4 bg-white/5 rounded w-64 mt-2" />
        </div>
      </div>
      <div className="bg-[#131518] rounded-2xl border border-white/5 p-6 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-6">
            <div className="h-4 bg-white/5 rounded w-32" />
            <div className="h-4 bg-white/5 rounded flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

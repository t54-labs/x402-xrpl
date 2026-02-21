export default function TransactionsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-white/5 rounded-lg w-48" />
        <div className="h-4 bg-white/5 rounded w-80 mt-3" />
      </div>
      <div className="bg-[#131518] rounded-xl border border-white/5 overflow-hidden">
        <div className="bg-[#181a1e] h-12 border-b border-white/5" />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-white/5 flex gap-6">
            <div className="h-4 bg-white/5 rounded w-36" />
            <div className="h-4 bg-white/5 rounded w-24" />
            <div className="h-4 bg-white/5 rounded flex-1" />
            <div className="h-4 bg-white/5 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

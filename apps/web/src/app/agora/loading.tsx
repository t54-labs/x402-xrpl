export default function AgoraLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 animate-pulse">
      <div>
        <div className="h-8 bg-white/5 rounded-lg w-40" />
        <div className="h-4 bg-white/5 rounded w-80 mt-3" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[#131518] rounded-xl border border-white/5 p-6 h-48" />
        ))}
      </div>
    </div>
  );
}

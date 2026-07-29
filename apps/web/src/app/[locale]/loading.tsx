export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 animate-pulse">
      <div className="h-8 bg-white/5 rounded-lg w-64" />
      <div className="h-4 bg-white/5 rounded w-96" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#131518] p-6 rounded-xl border border-white/5 h-28" />
        ))}
      </div>
      <div className="bg-[#131518] rounded-xl border border-white/5 h-96" />
    </div>
  );
}

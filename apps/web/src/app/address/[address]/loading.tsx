export default function AddressLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 animate-pulse">
      <div className="bg-[#131518] rounded-2xl border border-white/5 p-8 h-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="h-6 bg-white/5 rounded w-32" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#131518] rounded-xl border border-white/5 p-5 h-32" />
          ))}
        </div>
        <div className="lg:col-span-2">
          <div className="bg-[#131518] rounded-xl border border-white/5 h-96" />
        </div>
      </div>
    </div>
  );
}

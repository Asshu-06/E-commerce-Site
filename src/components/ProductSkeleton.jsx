export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="bg-stone-100" style={{ aspectRatio: '4/3' }} />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-stone-100 rounded-lg w-3/4" />
        <div className="h-3 bg-stone-100 rounded-lg w-1/2" />
        <div className="flex gap-2 mt-4">
          <div className="h-8 bg-stone-100 rounded-xl w-24" />
          <div className="h-8 bg-stone-100 rounded-xl flex-1" />
        </div>
      </div>
    </div>
  )
}

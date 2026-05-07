export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-200 rounded-full w-full" />
        <div className="h-3 bg-gray-200 rounded-full w-2/3" />
        <div className="flex gap-2 mt-4">
          <div className="h-8 bg-gray-200 rounded-full w-24" />
          <div className="h-8 bg-gray-200 rounded-full flex-1" />
        </div>
      </div>
    </div>
  )
}

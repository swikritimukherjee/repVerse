// components/SkeletonGrid.tsx
interface SkeletonGridProps {
  count: number;
}

export const SkeletonGrid = ({ count }: SkeletonGridProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
        <div className="p-5">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="flex justify-between mt-4">
            <div>
              <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-5 bg-gray-200 rounded w-24" />
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-5 bg-gray-200 rounded w-24" />
            </div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-full mt-4" />
        </div>
      </div>
    ))}
  </div>
);
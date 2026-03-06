/**
 * Loading Skeleton Components
 * Reusable skeleton loaders for different content types
 */

export function LessonSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Title skeleton */}
      <div className="border-b border-gray-200 pb-4">
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* Audio player skeleton */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>

      {/* Explanation skeleton */}
      <div>
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>
      </div>

      {/* Examples skeleton */}
      <div>
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-3"></div>
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>

      {/* Key points skeleton */}
      <div>
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-3"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start">
              <div className="w-6 h-6 bg-green-500 rounded-full mr-3"></div>
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function QuizSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>

      {/* Question skeleton */}
      <div className="bg-indigo-50 p-4 rounded-lg mb-6">
        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
      </div>

      {/* Options skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-full p-4 rounded-lg border-2 border-gray-200 bg-white"
          >
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>

      {/* Navigation skeleton */}
      <div className="flex justify-between mt-8">
        <div className="h-10 bg-gray-300 rounded w-24"></div>
        <div className="h-10 bg-gray-300 rounded w-24"></div>
      </div>
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-10 bg-gray-300 rounded w-1/3"></div>
          </div>
        ))}
      </div>

      {/* Recent activity skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CurriculumSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-full px-4 py-3 bg-gray-200 rounded-lg"
        >
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

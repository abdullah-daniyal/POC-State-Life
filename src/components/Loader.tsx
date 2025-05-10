import type React from "react"

const Loader: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="relative flex flex-col items-center">
        {/* Single spinning circle with gradient border */}
        <div className="w-32 h-32 rounded-full border-8 border-gray-200 border-t-blue-600 border-r-indigo-600 animate-spin"></div>
        
        {/* Loading text overlaid in center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="text-lg font-semibold text-gray-700 tracking-wider">Loading...</span>
        </div>
      </div>

      {/* Logo and text */}
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          State Life
        </h2>
        <p className="text-gray-600 mt-2">Loading dashboard data...</p>
      </div>

      {/* Animated dots */}
      <div className="flex mt-4 space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
      </div>
    </div>
  )
}

export default Loader

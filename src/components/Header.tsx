"use client"

import type React from "react"
import { BarChart3, RefreshCw } from "lucide-react"

interface HeaderProps {
  onRefresh?: () => void
}

const Header: React.FC<HeaderProps> = ({ onRefresh }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-10 w-10" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">State Life</h1>
            <p className="text-blue-100 mt-1">Insurance Call Analytics</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Refresh Data</span>
            </button>
          )}
          <div className="hidden md:block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-sm font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

import React, { useState } from "react";
import { BarChart3, RefreshCw, Clock, Settings } from "lucide-react";

interface HeaderProps {
  onRefresh?: () => void;
  autoRefreshEnabled?: boolean;
  onToggleAutoRefresh?: () => void;
  refreshInterval?: number; // in minutes
  onChangeRefreshInterval?: (minutes: number) => void;
  nextRefreshIn?: string;
  lastRefreshed?: Date | null;
}

const Header: React.FC<HeaderProps> = ({
  onRefresh,
  autoRefreshEnabled = false,
  onToggleAutoRefresh,
  refreshInterval = 5,
  onChangeRefreshInterval,
  nextRefreshIn = "",
  lastRefreshed = null,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  // Available refresh intervals in minutes
  const refreshIntervals = [1, 5, 10, 15, 30, 60];

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 md:p-6 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 md:h-10 md:w-10" />
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">State Life</h1>
            <p className="text-blue-100 text-sm md:text-base mt-0.5 md:mt-1">Insurance Call Analytics</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto md:space-x-4">
          {/* Mobile: Last refreshed info */}
          <div className="md:hidden text-xs text-blue-100">
            {lastRefreshed ? `Updated: ${lastRefreshed.toLocaleTimeString()}` : "Not refreshed"}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <div className="text-xs md:text-sm">
                {autoRefreshEnabled ? (
                  <span>
                    Next: <span className="font-medium">{nextRefreshIn}</span>
                  </span>
                ) : (
                  <span>Auto-refresh off</span>
                )}
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center bg-white/20 hover:bg-white/30 backdrop-blur-sm px-2 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline text-sm font-medium">Settings</span>
              </button>

              {showSettings && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 text-gray-800 p-4">
                  <h3 className="font-medium text-gray-700 mb-3">Auto-Refresh Settings</h3>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm">Auto-refresh</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={autoRefreshEnabled}
                        onChange={onToggleAutoRefresh}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm block mb-2">Refresh interval</label>
                    <div className="grid grid-cols-3 gap-2">
                      {refreshIntervals.map((interval) => (
                        <button
                          key={interval}
                          onClick={() => {
                            onChangeRefreshInterval?.(interval);
                          }}
                          className={`text-xs py-1 px-2 rounded ${
                            refreshInterval === interval
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {interval} {interval === 1 ? "min" : "mins"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <button
                      onClick={() => {
                        onRefresh?.();
                        setShowSettings(false);
                      }}
                      className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors text-sm"
                    >
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Refresh Now
                    </button>
                  </div>
                </div>
              )}
            </div>

            {onRefresh && (
              <button
                onClick={onRefresh}
                className="flex items-center bg-white/20 hover:bg-white/30 backdrop-blur-sm px-2 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors"
                aria-label="Refresh data"
              >
                <RefreshCw className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline text-sm font-medium">Refresh Data</span>
              </button>
            )}

            <div className="hidden md:block bg-white/20 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-lg">
              <p className="text-xs md:text-sm font-medium">
                {lastRefreshed ? `Last updated: ${lastRefreshed.toLocaleTimeString()}` : "Not yet refreshed"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
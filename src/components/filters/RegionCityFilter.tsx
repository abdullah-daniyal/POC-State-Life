"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { ChevronDown, ChevronUp, Check, X, Filter } from "lucide-react"
import type { InsuranceCall } from "../../types"

// Define the region and city data structure
interface RegionData {
  name: string
  cities: string[]
}

// All regions and their cities
const regionsData: RegionData[] = [
  {
    name: "SOUTHERN REGION",
    cities: ["Karachi (South)", "Karachi (Central)", "Karachi (Eastern)", "Quetta"],
  },
  {
    name: "HYDERABAD REGION",
    cities: ["Hyderabad", "Mirpurkhas (Sindh)", "Shaheed Benazirabad", "Sukkur", "Larkana"],
  },
  {
    name: "MULTAN REGION",
    cities: ["Multan", "Bahawalpur", "Rahim Yar Khan", "Sahiwal", "D.G. Khan", "Vehari"],
  },
  {
    name: "FAISALABAD REGION",
    cities: ["Faisalabad (Eastern)", "Faisalabad (Western)", "Sargodha", "Jhang"],
  },
  {
    name: "CENTRAL REGION",
    cities: ["Lahore (Central)", "Lahore (Western)", "Gujranwala", "Sialkot", "Narowal", "Sheikhupura"],
  },
  {
    name: "NORTHERN REGION",
    cities: ["Rawalpindi", "Islamabad", "Mirpur (AK)", "Gujrat", "Jhelum", "Gilgit"],
  },
  {
    name: "KPK REGION",
    cities: ["Peshawar", "Abbottabad", "Swat", "Kohat"],
  },
  {
    name: "TAKAFUL",
    cities: ["Takaful"],
  },
  {
    name: "GROUP AND PENSION",
    cities: ["Group and Pension"],
  },
  {
    name: "BANCA",
    cities: ["Banca"],
  }
]

interface RegionCityFilterProps {
  data: InsuranceCall[]
  onFilterChange: (filteredData: InsuranceCall[]) => void
}

const RegionCityFilter: React.FC<RegionCityFilterProps> = ({ data, onFilterChange }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [expandedRegions, setExpandedRegions] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])

  // Apply filters when selection changes
  const applyFilters = useCallback(() => {
    if (selectedCities.length === 0) {
      // If no cities selected, return all data
      onFilterChange(data)
    } else {
      // Filter data based on selected cities
      const filteredData = data.filter((call) => selectedCities.includes(call.zone))
      onFilterChange(filteredData)
    }
  }, [selectedCities, data, onFilterChange])

  // Only run the filter effect when selectedCities changes
  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  // Toggle region expansion
  const toggleRegion = (regionName: string) => {
    setExpandedRegions((prev) =>
      prev.includes(regionName) ? prev.filter((r) => r !== regionName) : [...prev, regionName],
    )
  }

  // Toggle city selection
  const toggleCity = (city: string) => {
    setSelectedCities((prev) => (prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]))
  }

  // Toggle all cities in a region
  const toggleRegionCities = (region: RegionData) => {
    const regionCities = region.cities
    const allSelected = regionCities.every((city) => selectedCities.includes(city))

    if (allSelected) {
      // If all cities in the region are selected, unselect them
      setSelectedCities((prev) => prev.filter((city) => !regionCities.includes(city)))
    } else {
      // Otherwise, select all cities in the region
      const citiesToAdd = regionCities.filter((city) => !selectedCities.includes(city))
      setSelectedCities((prev) => [...prev, ...citiesToAdd])
    }
  }

  // Check if all cities in a region are selected
  const isRegionSelected = (region: RegionData) => {
    return region.cities.every((city) => selectedCities.includes(city))
  }

  // Check if some cities in a region are selected
  const isRegionPartiallySelected = (region: RegionData) => {
    return (
      region.cities.some((city) => selectedCities.includes(city)) &&
      !region.cities.every((city) => selectedCities.includes(city))
    )
  }

  // Reset all filters
  const resetFilters = () => {
    setSelectedCities([])
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors"
        >
          <Filter className="mr-2 h-5 w-5" />
          Filter by Region & City
          {isFilterOpen ? <ChevronUp className="ml-2 h-5 w-5" /> : <ChevronDown className="ml-2 h-5 w-5" />}
        </button>
        {selectedCities.length > 0 && (
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">{selectedCities.length} selected</span>
            <button
              onClick={resetFilters}
              className="text-sm text-red-500 hover:text-red-700 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </button>
          </div>
        )}
      </div>

      {isFilterOpen && (
        <div className="mt-4 border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionsData.map((region) => (
              <div key={region.name} className="border rounded-lg overflow-hidden">
                <div
                  className={`flex items-center justify-between p-3 cursor-pointer ${
                    isRegionSelected(region)
                      ? "bg-blue-100 text-blue-800"
                      : isRegionPartiallySelected(region)
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-50 text-gray-800"
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <button
                      onClick={() => toggleRegionCities(region)}
                      className="mr-2 h-5 w-5 rounded border flex items-center justify-center"
                    >
                      {isRegionSelected(region) && <Check className="h-4 w-4 text-blue-600" />}
                      {isRegionPartiallySelected(region) && <div className="h-2 w-2 bg-blue-600 rounded-sm"></div>}
                    </button>
                    <span className="font-medium text-sm">{region.name}</span>
                  </div>
                  <button onClick={() => toggleRegion(region.name)}>
                    {expandedRegions.includes(region.name) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {expandedRegions.includes(region.name) && (
                  <div className="p-2 bg-white">
                    <div className="grid grid-cols-1 gap-1">
                      {region.cities.map((city) => (
                        <div
                          key={city}
                          className={`flex items-center p-2 rounded-md cursor-pointer ${
                            selectedCities.includes(city) ? "bg-blue-50" : "hover:bg-gray-50"
                          }`}
                          onClick={() => toggleCity(city)}
                        >
                          <div
                            className={`h-4 w-4 rounded border mr-2 flex items-center justify-center ${
                              selectedCities.includes(city) ? "border-blue-500 bg-blue-500" : "border-gray-300"
                            }`}
                          >
                            {selectedCities.includes(city) && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className="text-sm">{city}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4 pt-3 border-t">
            <div className="text-sm text-gray-500">
              {selectedCities.length === 0
                ? "All cities shown"
                : `Showing data for ${selectedCities.length} selected ${
                    selectedCities.length === 1 ? "city" : "cities"
                  }`}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={resetFilters}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCities.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedCities.map((city) => (
            <div key={city} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
              {city}
              <button onClick={() => toggleCity(city)} className="ml-1 focus:outline-none">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RegionCityFilter

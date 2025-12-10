'use client'

import { Button } from '@/components/ui/button'
import { Layers, Check, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export type LayerType = 'normal' | 'satellite' | 'minimal'

interface LayerOption {
  id: LayerType
  name: string
  description: string
  url: string
  attribution: string
}

const layerOptions: LayerOption[] = [
  {
    id: 'normal',
    name: 'Normal',
    description: 'Standard OpenStreetMap view',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?lang=en',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  {
    id: 'satellite',
    name: 'Satellite',
    description: 'Satellite imagery view',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, minimal map style',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
]

interface LayerSelectorProps {
  selectedLayer: LayerType
  onLayerChange: (layer: LayerType) => void
  className?: string
}

export function LayerSelector({ selectedLayer, onLayerChange, className = '' }: LayerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedLayerOption = layerOptions.find(layer => layer.id === selectedLayer)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className={`absolute z-[1000] ${className}`} ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 bg-white shadow-md hover:bg-gray-50 border-gray-300"
        title="Change map layer"
      >
        <Layers className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-12 w-64 bg-white rounded-md shadow-lg border border-gray-200 p-2 z-[1001]">
          <div className="space-y-1">
            <div className="px-2 py-1.5 text-sm font-medium text-gray-900">
              Map Layers
            </div>
            {layerOptions.map((layer) => (
              <button
                key={layer.id}
                onClick={() => {
                  onLayerChange(layer.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-start gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
                  selectedLayer === layer.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {selectedLayer === layer.id ? (
                    <Check className="h-4 w-4 text-blue-600" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{layer.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {layer.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function getLayerConfig(layerType: LayerType): LayerOption {
  return layerOptions.find(layer => layer.id === layerType) || layerOptions[0]
}

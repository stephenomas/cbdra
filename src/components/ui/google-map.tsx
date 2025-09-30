"use client"

import { useEffect, useRef, useState } from "react"
import { Wrapper, Status } from "@googlemaps/react-wrapper"

interface GoogleMapProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  initialLat?: number
  initialLng?: number
  height?: string
  width?: string
}

interface MapComponentProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  initialLat?: number
  initialLng?: number
}

const MapComponent: React.FC<MapComponentProps> = ({
  onLocationSelect,
  initialLat = 37.7749, // Default to San Francisco
  initialLng = -122.4194
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map>()
  const [marker, setMarker] = useState<google.maps.Marker>()

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center: { lat: initialLat, lng: initialLng },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })
      setMap(newMap)
    }
  }, [ref, map, initialLat, initialLng])

  useEffect(() => {
    if (map) {
      const newMarker = new google.maps.Marker({
        position: { lat: initialLat, lng: initialLng },
        map: map,
        draggable: true,
      })
      setMarker(newMarker)

      // Handle map clicks
      const clickListener = map.addListener("click", (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat()
          const lng = event.latLng.lng()
          
          // Update marker position
          newMarker.setPosition({ lat, lng })
          
          // Reverse geocode to get address
          const geocoder = new google.maps.Geocoder()
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              onLocationSelect(lat, lng, results[0].formatted_address)
            } else {
              onLocationSelect(lat, lng)
            }
          })
        }
      })

      // Handle marker drag
      const dragListener = newMarker.addListener("dragend", () => {
        const position = newMarker.getPosition()
        if (position) {
          const lat = position.lat()
          const lng = position.lng()
          
          // Reverse geocode to get address
          const geocoder = new google.maps.Geocoder()
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              onLocationSelect(lat, lng, results[0].formatted_address)
            } else {
              onLocationSelect(lat, lng)
            }
          })
        }
      })

      return () => {
        google.maps.event.removeListener(clickListener)
        google.maps.event.removeListener(dragListener)
      }
    }
  }, [map, onLocationSelect, initialLat, initialLng])

  return <div ref={ref} style={{ width: "100%", height: "400px" }} />
}

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border border-red-200">
          <div className="text-center">
            <p className="text-red-600 font-medium">Failed to load Google Maps</p>
            <p className="text-red-500 text-sm mt-1">Please check your API key configuration</p>
          </div>
        </div>
      )
    default:
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <p className="text-gray-600">Initializing map...</p>
        </div>
      )
  }
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  onLocationSelect,
  initialLat,
  initialLng,
  height = "400px",
  width = "100%"
}) => {
  // You'll need to set your Google Maps API key here
  // For production, use environment variables
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-96 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="text-center">
          <p className="text-yellow-800 font-medium">Google Maps API Key Required</p>
          <p className="text-yellow-700 text-sm mt-1">
            Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height, width }} className="rounded-lg overflow-hidden border border-gray-200">
      <Wrapper apiKey={apiKey} render={render}>
        <MapComponent
          onLocationSelect={onLocationSelect}
          initialLat={initialLat}
          initialLng={initialLng}
        />
      </Wrapper>
    </div>
  )
}
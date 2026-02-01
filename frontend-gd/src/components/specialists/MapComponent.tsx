'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'

if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

interface MapComponentProps {
  lat: number
  lng: number
  address: string
}

export default function MapComponent({ lat, lng, address }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    })

    L.control.zoom({
      position: 'topright'
    }).addTo(map)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 19,
    }).addTo(map)

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
        ">
          <div style="
            position: absolute;
            width: 32px;
            height: 32px;
            border-radius: 75%;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: white;
              box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
            "></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    })

    const marker = L.marker([lat, lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(`<div style="font-weight: 500; font-size: 12px; color: #374151; padding: 2px 0;">${address}</div>`, {
        className: 'custom-popup',
      })

    markerRef.current = marker
    mapInstanceRef.current = map
    marker.openPopup()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [lat, lng, address])

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl"
      style={{ zIndex: 0 }}
    />
  )
}

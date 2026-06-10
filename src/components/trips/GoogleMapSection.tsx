'use client'

import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api'
import { useMemo } from 'react'

const containerStyle = {
  width: '100%',
  height: '100%'
}

export default function GoogleMapSection({ schedules }: { schedules: any[] }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_ID || ''
  })

  const center = useMemo(() => (
    schedules.length > 0 
      ? { lat: Number(schedules[0].lat), lng: Number(schedules[0].lng) }
      : { lat: 37.5665, lng: 126.9780 }
  ), [schedules])

  const path = useMemo(() => (
    schedules.map(s => ({ lat: Number(s.lat), lng: Number(s.lng) }))
  ), [schedules])

  if (!isLoaded) return <div style={{ width: '100%', height: '100%', backgroundColor: '#eee' }}>지도를 불러오는 중...</div>

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {schedules.map((schedule, idx) => (
        <Marker
          key={schedule.id || idx}
          position={{ lat: Number(schedule.lat), lng: Number(schedule.lng) }}
          label={(idx + 1).toString()}
          title={schedule.place_name}
        />
      ))}

      {path.length > 1 && (
        <Polyline
          path={path}
          options={{
            strokeColor: '#0070f3',
            strokeOpacity: 0.8,
            strokeWeight: 3,
          }}
        />
      )}
    </GoogleMap>
  )
}

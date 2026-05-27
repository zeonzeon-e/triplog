'use client'

import { Container as MapContainer, NaverMap, Marker, Polyline, useNavermaps } from 'react-naver-maps'

interface NaverMapSectionProps {
  schedules: any[]
}

export default function NaverMapSection({ schedules }: NaverMapSectionProps) {
  const navermaps = useNavermaps()

  const center = schedules.length > 0 
    ? { lat: schedules[0].lat, lng: schedules[0].lng }
    : { lat: 37.5665, lng: 126.9780 } // Default: Seoul City Hall

  return (
    <MapContainer style={{ width: '100%', height: '100%' }}>
      <NaverMap
        defaultCenter={center}
        defaultZoom={13}
      >
        {schedules.map((schedule, idx) => (
          <Marker
            key={schedule.id}
            position={{ lat: schedule.lat, lng: schedule.lng }}
            title={schedule.place_name}
            label={(idx + 1).toString()}
          />
        ))}

        {schedules.length > 1 && (
          <Polyline 
            path={schedules.map(s => ({ lat: s.lat, lng: s.lng }))}
            strokeColor="#0070f3"
            strokeWeight={3}
          />
        )}
      </NaverMap>
    </MapContainer>
  )
}

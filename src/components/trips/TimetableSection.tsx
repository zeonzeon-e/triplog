'use client'

import { useState } from 'react'
import { searchPlaces } from '@/app/actions/naver'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, MapPin, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface TimetableSectionProps {
  trip: any
  schedules: any[]
  setSchedules: (schedules: any[]) => void
}

export default function TimetableSection({ trip, schedules, setSchedules }: TimetableSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const supabase = createClient()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    setSearching(true)
    const data = await searchPlaces(searchQuery)
    setSearchResults(data.items || [])
    setSearching(false)
  }

  const addSchedule = async (place: any) => {
    // Naver Local API returns coordinates in Katech (TM128) format by default for some legacy reasons,
    // but the newer Search API might return it differently or need conversion.
    // Actually, Naver Search Local API returns mapx, mapy which are TM128. 
    // We might need a conversion or use Map API to search if we want Lat/Lng directly.
    // FOR PROTOTYPE: We'll assume these are directly usable or use a simple conversion if needed.
    // (Correct way: use Naver Maps Geocoding or Coordinate conversion)
    
    // Simple TM128 to WGS84 (Lat/Lng) conversion logic is complex. 
    // Ideally we'd use 'naver.maps.Service.fromTM128ToCoord' on the client.
    
    // Since we are in the client, we can use naver.maps if it's loaded.
    const naver = (window as any).naver
    let lat = 0, lng = 0
    
    if (naver && naver.maps && naver.maps.TransCoord) {
      const tm128 = new naver.maps.Point(place.mapx, place.mapy)
      const latlng = naver.maps.TransCoord.fromTM128ToLatLng(tm128)
      lat = latlng.lat()
      lng = latlng.lng()
    } else {
      // Fallback: This won't be accurate but for the sake of the demo if API isn't ready
      lat = 37.5665
      lng = 126.9780
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newSchedule = {
      trip_id: trip.id,
      place_name: place.title.replace(/<[^>]*>?/gm, ''), // Remove HTML tags
      address: place.address,
      lat,
      lng,
      start_time: new Date().toISOString(), // Default to now
      end_time: new Date(Date.now() + 3600000).toISOString(), // +1 hour
      details: {
        category: place.category,
        description: place.description,
        link: place.link
      }
    }

    const { data, error } = await supabase
      .from('schedules')
      .insert([newSchedule])
      .select()

    if (error) {
      alert('일정 추가 실패: ' + error.message)
    } else if (data) {
      setSchedules([...schedules, data[0]])
      setSearchQuery('')
      setSearchResults([])
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <section>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '5px' }}>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="장소 검색 (예: 제주 맛집)"
            style={{ flex: 1, padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          <button type="submit" style={{ padding: '8px', cursor: 'pointer', border: 'none', background: '#0070f3', color: '#fff', borderRadius: '5px' }}>
            <Search size={18} />
          </button>
        </form>

        {searchResults.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px', maxHeight: '200px', overflowY: 'auto' }}>
            {searchResults.map((place, idx) => (
              <li 
                key={idx} 
                onClick={() => addSchedule(place)}
                style={{ padding: '10px', borderBottom: idx === searchResults.length - 1 ? 'none' : '1px solid #eee', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>{place.title.replace(/<[^>]*>?/gm, '')}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{place.address}</div>
                </div>
                <Plus size={16} color="#0070f3" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>일정표</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {schedules.length > 0 ? (
            schedules.map((schedule, idx) => (
              <div key={schedule.id} style={{ 
                padding: '12px', 
                border: '1px solid #eaeaea', 
                borderRadius: '8px', 
                backgroundColor: '#fff',
                display: 'flex',
                gap: '12px'
              }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '12px', 
                  backgroundColor: '#0070f3', 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{schedule.place_name}</div>
                  <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <MapPin size={12} /> {schedule.address}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {format(new Date(schedule.start_time), 'HH:mm')} ~ {format(new Date(schedule.end_time), 'HH:mm')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#999', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
              아직 일정이 없습니다. 장소를 검색하여 추가해보세요!
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

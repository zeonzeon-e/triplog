'use client'

import { useState } from 'react'
import { searchPlaces } from '@/app/actions/naver'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, MapPin, Clock, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
    const naver = (window as any).naver
    let lat = 0, lng = 0
    
    if (naver && naver.maps && naver.maps.TransCoord) {
      const tm128 = new naver.maps.Point(place.mapx, place.mapy)
      const latlng = naver.maps.TransCoord.fromTM128ToLatLng(tm128)
      lat = latlng.lat()
      lng = latlng.lng()
    } else {
      lat = 37.5665
      lng = 126.9780
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newSchedule = {
      trip_id: trip.id,
      place_name: place.title.replace(/<[^>]*>?/gm, ''),
      address: place.address,
      lat,
      lng,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
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
    <div className="flex flex-col gap-6">
      <section className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="장소 검색 (예: 제주 맛집)"
            className="flex-1 bg-secondary/30 border-none focus-visible:ring-primary"
          />
          <Button type="submit" size="icon" disabled={searching}>
            <Search className="w-4 h-4" />
          </Button>
        </form>

        {searchResults.length > 0 && (
          <Card className="border-border bg-card/50 overflow-hidden">
            <ul className="divide-y divide-border max-h-[300px] overflow-y-auto">
              {searchResults.map((place, idx) => (
                <li 
                  key={idx} 
                  onClick={() => addSchedule(place)}
                  className="p-3 hover:bg-secondary/50 cursor-pointer flex justify-between items-center transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{place.title.replace(/<[^>]*>?/gm, '')}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {place.address}
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-primary" />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> 일정표
          </h3>
          <Badge variant="outline" className="text-[10px] uppercase">{schedules.length} Places</Badge>
        </div>
        
        <div className="flex flex-col gap-3">
          {schedules.length > 0 ? (
            schedules.map((schedule, idx) => (
              <Card key={schedule.id} className="border-none bg-secondary/20 hover:bg-secondary/30 transition-colors">
                <CardContent className="p-4 flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{schedule.place_name}</div>
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> <span className="truncate">{schedule.address}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {format(new Date(schedule.start_time), 'HH:mm')} ~ {format(new Date(schedule.end_time), 'HH:mm')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-secondary/10 rounded-xl border-2 border-dashed border-border">
              <p className="text-xs text-muted-foreground">아직 일정이 없습니다.<br/>장소를 검색하여 추가해보세요!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

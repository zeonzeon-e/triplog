'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Calendar, Users, MapPin, ListTodo, Camera, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import TimetableSection from '@/components/trips/TimetableSection'
import LogSection from '@/components/trips/LogSection'
import GoogleMapSection from '@/components/trips/GoogleMapSection'
import { differenceInDays, parseISO, isAfter, isBefore } from 'date-fns'

interface TripDetailClientProps {
  trip: any
  initialSchedules: any[]
}

export default function TripDetailClient({ trip, initialSchedules }: TripDetailClientProps) {
  const [schedules, setSchedules] = useState(initialSchedules)
  const router = useRouter()

  const now = new Date()
  const startDate = parseISO(trip.start_date)
  const endDate = parseISO(trip.end_date)
  
  const isPast = isBefore(endDate, now) && !isAfter(now, endDate) // This is a bit tricky, let's just use simple comparison
  const isOngoing = !isPast && isAfter(now, startDate)
  const isFuture = isBefore(now, startDate)

  const dDay = differenceInDays(startDate, now)
  const dDayText = isPast ? '여행 종료' : isOngoing ? '여행 중' : `D-${dDay}`

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* 커스텀 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold leading-tight">{trip.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {trip.start_date} ~ {trip.end_date}</span>
              <Separator orientation="vertical" className="h-3" />
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {trip.companions?.join(', ') || '나홀로'}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" /> 여행 설정
        </Button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <Tabs defaultValue="itinerary" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 border-b border-border bg-card/30">
            <TabsList className="bg-transparent h-auto p-0 gap-6">
              <TabsTrigger 
                value="itinerary" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-sm font-medium"
              >
                <ListTodo className="w-4 h-4 mr-2" /> 상세 일정
              </TabsTrigger>
              <TabsTrigger 
                value="logs" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-sm font-medium"
              >
                <Camera className="w-4 h-4 mr-2" /> 여행 로그
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <TabsContent value="itinerary" className="flex-1 flex m-0 p-0 overflow-hidden">
              {/* 왼쪽: 일정 목록 */}
              <div className="w-[450px] border-right border-border overflow-y-auto bg-card/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">여행 코스</h2>
                  <Badge variant="secondary">{schedules.length}개의 장소</Badge>
                </div>
                <TimetableSection trip={trip} schedules={schedules} setSchedules={setSchedules} />
              </div>

              {/* 오른쪽: 지도 및 상세 요약 */}
              <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
                <Card className="flex-1 min-h-[400px] border-none shadow-lg overflow-hidden relative">
                  <GoogleMapSection schedules={schedules} />
                </Card>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-secondary/30 border-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> 주요 방문지
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{schedules[0]?.place_name || '미정'}</p>
                      <p className="text-xs text-muted-foreground mt-1">포함 총 {schedules.length}곳 {isPast ? '방문 완료' : '방문 예정'}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/30 border-none">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> 전체 기간
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{dDayText}</p>
                      <p className="text-xs text-muted-foreground mt-1">{trip.start_date} 부터</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="flex-1 m-0 p-0 overflow-y-auto bg-background">
              <div className="max-w-4xl mx-auto p-10">
                <LogSection trip={trip} schedules={schedules} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}

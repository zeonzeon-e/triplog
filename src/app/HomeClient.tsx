'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, LogOut, Plane, MapPin } from 'lucide-react'
import { TripListCard } from '@/components/trips/TripListCard'

export default function HomePage({ initialTrips }: { initialTrips: any[] }) {
  const [trips, setTrips] = useState(initialTrips)
  const router = useRouter()
  const supabase = createClient()

  const fetchTrips = async () => {
    const { data } = await supabase
      .from('trips')
      .select('*')
      .order('start_date', { ascending: true })
    if (data) setTrips(data)
  }

  const now = new Date().toISOString().split('T')[0]
  const upcomingTrips = trips?.filter(trip => trip.end_date >= now) || []
  const pastTrips = trips?.filter(trip => trip.end_date < now).reverse() || []

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-2">
          <Plane className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">나의 여행지</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/trips/new">
            <Button size="sm" className="gap-2 shadow-md hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" />
              여행 계획하기
            </Button>
          </Link>
          
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" size="icon" title="로그아웃">
              <LogOut className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </header>

      <Tabs defaultValue="upcoming" className="w-full">
        <div className="flex items-center justify-between mb-6 border-b border-border pb-1">
          <TabsList className="bg-transparent h-auto p-0 gap-6">
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2 text-lg font-semibold"
            >
              예정된 여행
              <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary border-none">
                {upcomingTrips.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2 text-lg font-semibold"
            >
              지난 여행
              <Badge variant="secondary" className="ml-2">
                {pastTrips.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upcoming">
          {upcomingTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTrips.map((trip) => (
                <TripListCard key={trip.id} trip={trip} onUpdate={fetchTrips} />
              ))}
            </div>
          ) : (
            <EmptyState message="예정된 여행이 없습니다. 새로운 모험을 떠나볼까요?" />
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastTrips.map((trip) => (
                <TripListCard key={trip.id} trip={trip} isPast onUpdate={fetchTrips} />
              ))}
            </div>
          ) : (
            <EmptyState message="아직 다녀온 여행이 없네요. 여행의 추억을 쌓아보세요!" />
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-secondary/20 rounded-2xl border-2 border-dashed border-border">
      <div className="rounded-full bg-secondary p-4">
        <MapPin className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground max-w-[250px]">{message}</p>
      <Link href="/trips/new">
        <Button variant="outline" size="sm">계획 시작하기</Button>
      </Link>
    </div>
  )
}

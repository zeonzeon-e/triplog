import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import TripDetailClient from './TripDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TripDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single()

  if (!trip) {
    return notFound()
  }

  const { data: schedules } = await supabase
    .from('schedules')
    .select('*')
    .eq('trip_id', id)
    .order('start_time', { ascending: true })

  return (
    <TripDetailClient trip={trip} initialSchedules={schedules || []} />
  )
}

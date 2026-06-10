"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plane, ChevronRight, ChevronLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'

export default function NewTripPage() {
  const [title, setTitle] = useState('')
  const [companions, setCompanions] = useState('')
  const [date, setDate] = useState<DateRange | undefined>()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleCreateTrip(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !date?.from || !date?.to) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('trips')
      .insert([
        { 
          user_id: user.id, 
          title, 
          start_date: format(date.from, 'yyyy-MM-dd'), 
          end_date: format(date.to, 'yyyy-MM-dd'), 
          companions: companions ? companions.split(',').map(c => c.trim()) : []
        }
      ])
      .select()

    if (!error && data) {
      router.push(`/trips/${data[0].id}`)
    } else {
      setLoading(false)
      alert('여행 생성 실패')
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 md:p-12">
      <Card className="w-full max-w-2xl border-none shadow-2xl bg-card/50 backdrop-blur-xl overflow-hidden">
        <CardHeader className="space-y-4 text-center p-10 pb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-300">
            <Plane className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tight italic">NEW ADVENTURE</CardTitle>
            <p className="text-muted-foreground text-base">새로운 여행의 시작, 설레는 계획을 세워보세요.</p>
          </div>
        </CardHeader>
        <CardContent className="p-10 pt-4">
          <form onSubmit={handleCreateTrip} className="space-y-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-primary">여행 제목</Label>
                <Input 
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 발리에서 한 달 살기 🌴" 
                  required 
                  className="bg-secondary/30 border-none focus-visible:ring-primary h-14 px-6 text-lg rounded-xl"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-bold uppercase tracking-wider text-primary">여행 일정</Label>
                <div className="p-1 bg-secondary/10 rounded-2xl">
                  <DatePickerWithRange date={date} setDate={setDate} />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="companions" className="text-sm font-bold uppercase tracking-wider text-primary">동행자</Label>
                <Input 
                  id="companions"
                  value={companions}
                  onChange={(e) => setCompanions(e.target.value)}
                  placeholder="동행자 이름을 쉼표로 구분 (예: 길동, 철수)" 
                  className="bg-secondary/30 border-none focus-visible:ring-primary h-14 px-6 text-lg rounded-xl"
                />
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <Link href="/" className="flex-1">
                <Button type="button" variant="ghost" className="w-full h-14 text-base font-semibold hover:bg-secondary rounded-xl transition-colors">
                  돌아가기
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="flex-[2] h-14 text-lg font-black shadow-xl shadow-primary/20 rounded-xl active:scale-95 transition-all">
                {loading ? '모험 준비 중...' : '여행 시작하기'} <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

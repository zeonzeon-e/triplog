'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Calendar as CalendarIcon, 
  Users, 
  Check, 
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { parseISO, format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export function TripListCard({ trip, isPast = false, onUpdate }: { trip: any; isPast?: boolean; onUpdate: () => void }) {
  const supabase = createClient()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(trip.title)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: parseISO(trip.start_date),
    to: parseISO(trip.end_date)
  })
  const [editData, setEditData] = useState({
    companions: trip.companions?.join(', ') || ''
  })
  const router = useRouter()

  const handleUpdateTitle = async () => {
    if (editedTitle.trim() === '') return
    const { error } = await supabase
      .from('trips')
      .update({ title: editedTitle })
      .eq('id', trip.id)
    
    if (!error) {
      setIsEditingTitle(false)
      onUpdate()
    }
  }

  const handleUpdateDetails = async () => {
    if (!dateRange?.from || !dateRange?.to) return

    const { error } = await supabase
      .from('trips')
      .update({
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
        companions: editData.companions.split(',').map((c: string) => c.trim()).filter(Boolean)
      })
      .eq('id', trip.id)

    if (!error) {
      setIsEditDialogOpen(false)
      onUpdate()
    }
  }

  const handleDelete = async () => {
    if (confirm('정말 이 여행을 삭제하시겠습니까?')) {
      const { error } = await supabase.from('trips').delete().eq('id', trip.id)
      if (!error) onUpdate()
    }
  }

  return (
    <Card className={`group relative overflow-hidden border-none transition-all shadow-sm ${
      isPast 
        ? 'bg-secondary/20 opacity-80 hover:opacity-100 grayscale-[0.3] hover:grayscale-0' 
        : 'bg-secondary/40 hover:bg-secondary/60'
    }`}>
      <CardHeader className="pb-3 pr-10">
        <div className="flex justify-between items-start">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 w-full">
              <Input 
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="h-8 py-0 focus-visible:ring-primary"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateTitle()
                  if (e.key === 'Escape') {
                    setEditedTitle(trip.title)
                    setIsEditingTitle(false)
                  }
                }}
              />
              <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={handleUpdateTitle}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setIsEditingTitle(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-1 w-full cursor-pointer" onClick={() => router.push(`/trips/${trip.id}`)}>
              <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
                {trip.title}
              </CardTitle>
            </div>
          )}
          
          <div className="absolute top-4 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                  <Pencil className="mr-2 w-4 h-4" /> 제목 수정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <CalendarIcon className="mr-2 w-4 h-4" /> 일정/동행자 수정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 w-4 h-4" /> 삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 cursor-pointer" onClick={() => router.push(`/trips/${trip.id}`)}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="w-4 h-4" />
          <span>{trip.start_date} ~ {trip.end_date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="line-clamp-1">
            {trip.companions?.length > 0 ? trip.companions.join(', ') : '나홀로 여행'}
          </span>
        </div>
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none bg-card/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Pencil className="w-5 h-5 text-primary" />
              </div>
              여행 정보 수정
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-8 py-6 space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" /> 여행 기간 설정
              </label>
              <div className="p-1 bg-secondary/20 rounded-xl">
                <DatePickerWithRange 
                  date={dateRange} 
                  setDate={setDateRange} 
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" /> 동행자 정보
              </label>
              <Input 
                placeholder="동행자가 있다면 이름을 쉼표로 구분하여 입력하세요 (예: 홍길동, 김철수)"
                value={editData.companions} 
                onChange={(e) => setEditData({...editData, companions: e.target.value})} 
                className="bg-secondary/30 border-none h-14 px-5 text-base focus-visible:ring-primary rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="p-8 pt-4 bg-secondary/10 gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setIsEditDialogOpen(false)} 
              className="h-12 px-8 text-base font-medium hover:bg-secondary"
            >
              취소
            </Button>
            <Button 
              onClick={handleUpdateDetails} 
              disabled={!dateRange?.from || !dateRange?.to}
              className="h-12 px-10 text-base font-bold shadow-lg shadow-primary/20 rounded-xl"
            >
              수정사항 저장하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

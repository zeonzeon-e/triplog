'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Camera, Video, Star, Trash2, Play, Plus, ShoppingBag, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import VlogViewer from './VlogViewer'
import { format } from 'date-fns'

interface LogSectionProps {
  trip: any
  schedules: any[]
}

export default function LogSection({ trip, schedules }: LogSectionProps) {
  const [logs, setLogs] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [content, setContent] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState<string>('')
  const [rating, setRating] = useState(0)
  const [shoppingInput, setShoppingInput] = useState('')
  const [showVlog, setShowVlog] = useState(false)
  const supabase = createClient()

  const fetchLogs = useCallback(async () => {
    const { data } = await supabase
      .from('logs')
      .select('*, schedules(place_name)')
      .eq('trip_id', trip.id)
      .order('created_at', { ascending: false })
    
    setLogs(data || [])
  }, [supabase, trip.id])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${trip.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('trip-logs')
      .upload(filePath, file)

    if (uploadError) {
      alert('업로드 실패: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('trip-logs')
      .getPublicUrl(filePath)

    const mediaType = file.type.startsWith('video') ? 'video' : 'photo'

    // Parse shopping input (item:price, item:price)
    const shoppingList = shoppingInput
      .split(',')
      .map(item => {
        const [name, price] = item.split(':').map(s => s.trim())
        if (name && price) return { name, price: parseInt(price) || 0 }
        return null
      })
      .filter(Boolean)

    const { error: insertError } = await supabase
      .from('logs')
      .insert([{
        trip_id: trip.id,
        schedule_id: selectedSchedule || null,
        media_type: mediaType,
        media_url: publicUrl,
        content: content,
        rating: rating > 0 ? rating : null,
        shopping_list: shoppingList
      }])

    if (insertError) {
      alert('기록 저장 실패: ' + insertError.message)
    } else {
      setContent('')
      setRating(0)
      setSelectedSchedule('')
      setShoppingInput('')
      fetchLogs()
    }
    
    setUploading(false)
  }

  const handleDeleteLog = async (id: string, url: string) => {
    if (!confirm('정말 이 기록을 삭제하시겠습니까?')) return

    const { error: deleteError } = await supabase
      .from('logs')
      .delete()
      .eq('id', id)

    if (!deleteError) {
      // Storage에서 파일 삭제 (선택 사항)
      const path = url.split('trip-logs/').pop()
      if (path) {
        await supabase.storage.from('trip-logs').remove([path])
      }
      fetchLogs()
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">여행 기록</h2>
        {logs.length > 0 && (
          <Button 
            onClick={() => setShowVlog(true)}
            className="rounded-full gap-2 shadow-lg shadow-primary/20"
          >
            <Play className="w-4 h-4 fill-current" /> 브이로그 재생
          </Button>
        )}
      </div>

      {showVlog && (
        <VlogViewer logs={[...logs].reverse()} onClose={() => setShowVlog(false)} />
      )}

      <Card className="border-none bg-secondary/20 shadow-none overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <h3 className="font-bold flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" /> 오늘 최고의 순간 기록
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
                <SelectTrigger className="bg-background/50 border-none h-12">
                  <SelectValue placeholder="관련 장소 선택 (선택 사항)" />
                </SelectTrigger>
                <SelectContent>
                  {schedules.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.place_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="어떤 추억을 남기고 싶으신가요?"
                className="bg-background/50 border-none min-h-[120px] focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" /> 나의 별점
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary" /> 쇼핑/지출 리스트
                </label>
                <Input 
                  placeholder="품목:가격 (예: 기념품:15000)"
                  value={shoppingInput}
                  onChange={(e) => setShoppingInput(e.target.value)}
                  className="bg-background/50 border-none h-12 focus-visible:ring-primary"
                />
              </div>

              <div className="pt-2">
                <label className="w-full">
                  <Button asChild className="w-full h-14 text-lg font-bold gap-3 rounded-xl cursor-pointer" disabled={uploading}>
                    <div>
                      <Plus className="w-6 h-6" /> {uploading ? '업로드 중...' : '사진/동영상 선택하여 저장'}
                      <input 
                        type="file" 
                        accept="image/*,video/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        disabled={uploading}
                      />
                    </div>
                  </Button>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h3 className="font-bold text-lg">기록 타임라인</h3>
        <div className="grid grid-cols-1 gap-6">
          {logs.map(log => (
            <Card key={log.id} className="border-none bg-card hover:shadow-md transition-shadow overflow-hidden group">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-[250px] aspect-square relative shrink-0">
                    {log.media_type === 'photo' ? (
                      <img 
                        src={log.media_url} 
                        alt="Log" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <video 
                        src={log.media_url} 
                        className="w-full h-full object-cover" 
                        muted 
                        onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                        onMouseOut={(e) => {
                          (e.target as HTMLVideoElement).pause()
                          (e.target as HTMLVideoElement).currentTime = 0
                        }}
                      />
                    )}
                    {log.media_type === 'video' && (
                      <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground font-mono">
                            {format(new Date(log.created_at), 'yyyy.MM.dd HH:mm')}
                          </span>
                          {log.schedules && (
                            <div className="font-bold text-primary flex items-center gap-1">
                              <MapPin className="w-4 h-4" /> {log.schedules.place_name}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {log.rating && (
                            <div className="flex gap-0.5">
                              {[...Array(log.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteLog(log.id, log.media_url)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-base leading-relaxed whitespace-pre-wrap">{log.content}</p>
                    </div>

                    {log.shopping_list?.length > 0 && (
                      <div className="mt-6 p-4 bg-secondary/30 rounded-lg space-y-2">
                        <div className="text-xs font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                          <ShoppingBag className="w-3 h-3" /> 지출 내역
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {log.shopping_list.map((item: any, i: number) => (
                            <Badge key={i} variant="outline" className="bg-background/50 border-none px-3 py-1">
                              {item.name}: {item.price.toLocaleString()}원
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-20 bg-secondary/10 rounded-2xl border-2 border-dashed border-border">
              <Camera className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">아직 남긴 기록이 없습니다.<br/>소중한 순간을 기록해보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

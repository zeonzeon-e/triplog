'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Camera, Image as ImageIcon, Video, Star, Trash2, Play } from 'lucide-react'
import VlogViewer from './VlogViewer'

interface LogSectionProps {
  trip: any
  schedules: any[]
}

export default function LogSection({ trip, schedules }: LogSectionProps) {
  const [logs, setLogs] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [content, setContent] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState('')
  const [rating, setRating] = useState(0)
  const [showVlog, setShowVlog] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchLogs()
  }, [trip.id])

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('logs')
      .select('*, schedules(place_name)')
      .eq('trip_id', trip.id)
      .order('created_at', { ascending: false })
    
    setLogs(data || [])
  }

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

    const { error: insertError } = await supabase
      .from('logs')
      .insert([{
        trip_id: trip.id,
        schedule_id: selectedSchedule || null,
        media_type: mediaType,
        media_url: publicUrl,
        content: content,
        rating: rating > 0 ? rating : null
      }])

    if (insertError) {
      alert('기록 저장 실패: ' + insertError.message)
    } else {
      setContent('')
      setRating(0)
      setSelectedSchedule('')
      fetchLogs()
    }
    
    setUploading(false)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>여행 기록</h3>
        {logs.length > 0 && (
          <button 
            onClick={() => setShowVlog(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 16px', 
              backgroundColor: '#333', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '20px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            <Play size={16} fill="white" /> 브이로그 재생
          </button>
        )}
      </div>

      {showVlog && (
        <VlogViewer logs={[...logs].reverse()} onClose={() => setShowVlog(false)} />
      )}

      <section style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
        <h3 style={{ marginTop: 0 }}>오늘의 기록 남기기</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <select 
            value={selectedSchedule} 
            onChange={(e) => setSelectedSchedule(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="">관련 장소 선택 (선택 사항)</option>
            {schedules.map(s => (
              <option key={s.id} value={s.id}>{s.place_name}</option>
            ))}
          </select>

          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="지금 이 순간의 기분은 어떤가요?"
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', minHeight: '80px', resize: 'vertical' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>맛평가/별점:</span>
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star} 
                size={20} 
                fill={star <= rating ? '#FFD700' : 'none'} 
                color={star <= rating ? '#FFD700' : '#ccc'}
                onClick={() => setRating(star)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px' }}>쇼핑 리스트 (아이템:가격, 예: 초콜릿:5000)</label>
            <input 
              type="text" 
              id="shoppingInput"
              placeholder="품목:가격, 품목:가격..."
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              padding: '12px', 
              backgroundColor: '#0070f3', 
              color: '#fff', 
              borderRadius: '5px', 
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.7 : 1
            }}>
              <Camera size={20} /> 사진/동영상 추가
              <input 
                type="file" 
                accept="image/*,video/*" 
                onChange={handleFileUpload} 
                disabled={uploading}
                style={{ display: 'none' }} 
              />
            </label>
          </div>
          {uploading && <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>업로드 중...</p>}
        </div>
      </section>

      <section>
        <h3>나의 기록들</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {logs.map(log => (
            <div key={log.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                {log.media_type === 'photo' ? (
                  <img src={log.media_url} alt="Log" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <video src={log.media_url} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} controls />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '12px', color: '#999' }}>{new Date(log.created_at).toLocaleString()}</span>
                    {log.rating && (
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(log.rating)].map((_, i) => <Star key={i} size={12} fill="#FFD700" color="#FFD700" />)}
                      </div>
                    )}
                  </div>
                  {log.schedules && (
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0070f3', marginTop: '4px' }}>
                      @ {log.schedules.place_name}
                    </div>
                  )}
                  <p style={{ margin: '8px 0', fontSize: '15px', lineHeight: '1.5' }}>{log.content}</p>
                </div>
              </div>
            </div>
          ))}
          {logs.length === 0 && <p style={{ color: '#999', textAlign: 'center' }}>아직 남긴 기록이 없습니다.</p>}
        </div>
      </section>
    </div>
  )
}

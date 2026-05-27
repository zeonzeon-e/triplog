'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewTripPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const companions = (formData.get('companions') as string).split(',').map(s => s.trim()).filter(s => s !== '')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('trips')
      .insert([
        { 
          user_id: user.id,
          title, 
          start_date: startDate, 
          end_date: endDate, 
          companions 
        }
      ])
      .select()

    if (error) {
      alert('저장 중 오류가 발생했습니다: ' + error.message)
    } else if (data) {
      router.push(`/trips/${data[0].id}`)
      router.refresh()
    }
    
    setLoading(false)
  }

  return (
    <main style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>새로운 여행 계획</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label htmlFor="title">여행 이름</label>
          <input type="text" id="title" name="title" required placeholder="예: 제주도 가족 여행" style={{ padding: '10px' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="startDate">시작 날짜</label>
            <input type="date" id="startDate" name="startDate" required style={{ padding: '10px' }} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="endDate">종료 날짜</label>
            <input type="date" id="endDate" name="endDate" required style={{ padding: '10px' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label htmlFor="companions">동행인 (쉼표로 구분)</label>
          <input type="text" id="companions" name="companions" placeholder="예: 엄마, 아빠, 동생" style={{ padding: '10px' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            type="button" 
            onClick={() => router.back()} 
            style={{ flex: 1, padding: '12px', cursor: 'pointer', backgroundColor: '#eee', border: 'none', borderRadius: '5px' }}
          >
            취소
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              flex: 2, 
              padding: '12px', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              backgroundColor: '#0070f3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px' 
            }}
          >
            {loading ? '저장 중...' : '여행 생성하기'}
          </button>
        </div>
      </form>
    </main>
  )
}

'use client'

import { useState } from 'react'
import { NavermapsProvider } from 'react-naver-maps'
import TripHeader from '@/components/trips/TripHeader'
import NaverMapSection from '@/components/trips/NaverMapSection'
import TimetableSection from '@/components/trips/TimetableSection'
import LogSection from '@/components/trips/LogSection'

interface TripDetailClientProps {
  trip: any
  initialSchedules: any[]
}

export default function TripDetailClient({ trip, initialSchedules }: TripDetailClientProps) {
  const [schedules, setSchedules] = useState(initialSchedules)
  const [activeTab, setActiveTab] = useState<'plan' | 'log'>('plan')

  // 네이버 지도 클라이언트 ID는 환경변수에서 가져와야 하지만, 
  // 클라이언트 컴포넌트에서 직접 사용하려면 NEXT_PUBLIC_ 접두사가 필요합니다.
  const ncpClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || ''

  return (
    <NavermapsProvider ncpClientId={ncpClientId}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TripHeader trip={trip} activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {activeTab === 'plan' ? (
            <>
              <div style={{ width: '400px', borderRight: '1px solid #ddd', overflowY: 'auto', padding: '10px' }}>
                <TimetableSection trip={trip} schedules={schedules} setSchedules={setSchedules} />
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <NaverMapSection schedules={schedules} />
              </div>
            </>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <LogSection trip={trip} schedules={schedules} />
            </div>
          )}
        </main>
      </div>
    </NavermapsProvider>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

interface TripHeaderProps {
  trip: any
  activeTab: 'plan' | 'log'
  onTabChange: (tab: 'plan' | 'log') => void
}

export default function TripHeader({ trip, activeTab, onTabChange }: TripHeaderProps) {
  const router = useRouter()

  return (
    <header style={{ 
      padding: '10px 20px', 
      borderBottom: '1px solid #ddd', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#fff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={() => router.push('/')} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.2rem' }}>{trip.title}</h1>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
            {trip.start_date} ~ {trip.end_date} | 동행: {trip.companions?.join(', ') || '없음'}
          </p>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '5px', backgroundColor: '#f0f0f0', padding: '4px', borderRadius: '8px' }}>
        <button 
          onClick={() => onTabChange('plan')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'plan' ? '#fff' : 'transparent',
            boxShadow: activeTab === 'plan' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            fontWeight: activeTab === 'plan' ? 'bold' : 'normal'
          }}
        >
          여행 계획
        </button>
        <button 
          onClick={() => onTabChange('log')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'log' ? '#fff' : 'transparent',
            boxShadow: activeTab === 'log' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            fontWeight: activeTab === 'log' ? 'bold' : 'normal'
          }}
        >
          여행 로그
        </button>
      </nav>
    </header>
  )
}

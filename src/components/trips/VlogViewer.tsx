'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface VlogViewerProps {
  logs: any[]
  onClose: () => void
}

export default function VlogViewer({ logs, onClose }: VlogViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (logs.length === 0) return

    const duration = 5000 // 5 seconds per slide
    const interval = 50
    const step = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext()
          return 0
        }
        return prev + step
      })
    }, interval)

    return () => clearInterval(timer)
  }, [currentIndex, logs.length])

  const handleNext = () => {
    if (currentIndex < logs.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setProgress(0)
    }
  }

  if (logs.length === 0) return null

  const currentLog = logs[currentIndex]

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#000', 
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff'
    }}>
      {/* Progress Bars */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '10px', 
        right: '10px', 
        display: 'flex', 
        gap: '4px',
        zIndex: 1010
      }}>
        {logs.map((_, idx) => (
          <div key={idx} style={{ flex: 1, height: '2px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '1px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              backgroundColor: '#fff', 
              width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
              transition: idx === currentIndex ? 'none' : 'width 0.3s'
            }} />
          </div>
        ))}
      </div>

      <button 
        onClick={onClose} 
        style={{ position: 'absolute', top: '40px', right: '20px', background: 'none', border: 'none', color: '#fff', zIndex: 1010, cursor: 'pointer' }}
      >
        <X size={30} />
      </button>

      {/* Media Content */}
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {currentLog.media_type === 'photo' ? (
          <img 
            src={currentLog.media_url} 
            alt="Vlog" 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
          />
        ) : (
          <video 
            src={currentLog.media_url} 
            autoPlay 
            muted 
            playsInline
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
          />
        )}
      </div>

      {/* Overlay Info */}
      <div style={{ 
        position: 'absolute', 
        bottom: '60px', 
        left: '20px', 
        right: '20px', 
        textAlign: 'center',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        padding: '20px',
        borderRadius: '0 0 10px 10px'
      }}>
        {currentLog.schedules && (
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
            {currentLog.schedules.place_name}
          </div>
        )}
        <p style={{ fontSize: '16px', margin: 0 }}>{currentLog.content}</p>
      </div>

      {/* Navigation Areas */}
      <div 
        onClick={handlePrev} 
        style={{ position: 'absolute', left: 0, top: 0, width: '30%', height: '100%', cursor: 'pointer', zIndex: 1005 }} 
      />
      <div 
        onClick={handleNext} 
        style={{ position: 'absolute', right: 0, top: 0, width: '30%', height: '100%', cursor: 'pointer', zIndex: 1005 }} 
      />
    </div>
  )
}

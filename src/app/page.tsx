import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1>나의 여행지</h1>
        <form action="/auth/signout" method="post">
          <button type="submit" style={{ padding: '5px 10px', cursor: 'pointer' }}>로그아웃</button>
        </form>
      </header>

      <section style={{ marginBottom: '40px' }}>
        <Link 
          href="/trips/new"
          style={{
            display: 'inline-block',
            padding: '15px 30px',
            backgroundColor: '#0070f3',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          + 새로운 여행 계획하기
        </Link>
      </section>

      <section>
        <h2>최근 여행 목록</h2>
        {trips && trips.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {trips.map((trip) => (
              <Link 
                key={trip.id} 
                href={`/trips/${trip.id}`}
                style={{
                  border: '1px solid #eaeaea',
                  padding: '20px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 0.2s'
                }}
              >
                <h3 style={{ margin: '0 0 10px 0' }}>{trip.title}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  {trip.start_date} ~ {trip.end_date}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: '#999', marginTop: '20px' }}>등록된 여행 계획이 없습니다. 첫 번째 여행을 계획해보세요!</p>
        )}
      </section>
    </main>
  )
}

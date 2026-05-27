import GoogleSigninButton from '@/components/auth/GoogleSigninButton'

export default function LoginPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '20px'
    }}>
      <h1>나만의 여행일지</h1>
      <p>여행 계획부터 추억 기록까지 한 번에 관리하세요.</p>
      <GoogleSigninButton />
    </div>
  )
}

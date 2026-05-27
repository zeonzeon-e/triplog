'use client'

import { createClient } from '@/utils/supabase/client'

export default function GoogleSigninButton() {
  const supabase = createClient()

  const handleSignin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button 
      onClick={handleSignin}
      style={{
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '5px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      <img src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} />
      구글로 로그인하기
    </button>
  )
}

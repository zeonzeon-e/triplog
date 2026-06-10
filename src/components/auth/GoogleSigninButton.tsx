'use client'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'

export default function GoogleSigninButton() {
  const supabase = createClient()

  const handleSignin = async () => {
    console.log('구글 로그인 버튼 클릭됨');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error;
      console.log('OAuth 시작됨:', data);
    } catch (error) {
      console.error('로그인 에러:', error);
    }
  }

  return (
    <Button 
      onClick={handleSignin}
      variant="outline"
      size="lg"
      className="w-full h-12 flex items-center gap-3 text-base font-medium"
    >
      <img src="https://www.google.com/favicon.ico" alt="Google" width={20} height={20} />
      구글로 계속하기
    </Button>
  )
}

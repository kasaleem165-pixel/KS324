import { useState, useEffect } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  isAdmin: boolean
  loading: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAdmin: false,
    loading: true,
  })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const isAdmin = session ? await checkAdmin(session.user.id) : false
      setState({ user: session?.user ?? null, session, isAdmin, loading: false })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const isAdmin = session ? await checkAdmin(session.user.id) : false
      setState({ user: session?.user ?? null, session, isAdmin, loading: false })
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}

async function checkAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' })
  return data === true
}

import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, User } from '@/lib/supabase'

export interface AuthState {
  user: SupabaseUser | null
  userProfile: User | null
  loading: boolean
  isAdmin: boolean
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
    isAdmin: false
  })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setState(prev => ({ ...prev, loading: false }))
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setState({
          user: null,
          userProfile: null,
          loading: false,
          isAdmin: false
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      setState({
        user: user.user,
        userProfile: profile,
        loading: false,
        isAdmin: profile?.is_admin || false
      })
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    setState(prev => ({ ...prev, loading: true }))
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null
        }
      }
    })

    if (error) {
      setState(prev => ({ ...prev, loading: false }))
      throw error
    }

    return data
  }

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }))
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setState(prev => ({ ...prev, loading: false }))
      throw error
    }

    return data
  }

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }))
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      setState(prev => ({ ...prev, loading: false }))
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) throw error
  }

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    resetPassword
  }
}
import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  is_admin: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

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
    console.log('Setting up auth listeners...')
    
    // Listen for auth changes FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, 'Session exists:', !!session)
      
      if (session?.user) {
        // Use setTimeout to defer the profile fetch and avoid blocking the auth callback
        setTimeout(() => {
          fetchUserProfile(session.user.id)
        }, 0)
      } else {
        setState({
          user: null,
          userProfile: null,
          loading: false,
          isAdmin: false
        })
      }
    })

    // Get initial session AFTER setting up the listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', !!session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setState(prev => ({ ...prev, loading: false }))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user ID:', userId)
      
      // Get the current user from the session
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('Current user:', user, 'User error:', userError)
      
      if (userError) {
        console.error('Error getting current user:', userError)
        setState(prev => ({ ...prev, loading: false }))
        return
      }

      // Fetch the user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      console.log('Profile data:', profile, 'Profile error:', profileError)

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        // Even if profile fetch fails, we still have the authenticated user
        setState({
          user: user,
          userProfile: null,
          loading: false,
          isAdmin: false
        })
        return
      }

      // If no profile exists, create one
      if (!profile && user) {
        console.log('No profile found, creating one...')
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || 'User',
            email: user.email || '',
            phone: user.user_metadata?.phone || null
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
          setState({
            user: user,
            userProfile: null,
            loading: false,
            isAdmin: false
          })
        } else {
          console.log('Profile created successfully:', newProfile)
          setState({
            user: user,
            userProfile: newProfile,
            loading: false,
            isAdmin: newProfile?.is_admin || false
          })
        }
        return
      }

      // Profile exists, set state
      setState({
        user: user,
        userProfile: profile,
        loading: false,
        isAdmin: profile?.is_admin || false
      })
      
      console.log('Auth state updated successfully')
    } catch (error) {
      console.error('Unexpected error in fetchUserProfile:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    setState(prev => ({ ...prev, loading: true }))
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
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
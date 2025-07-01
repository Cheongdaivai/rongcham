import { createClient } from './supabase/client'
import { User } from '@supabase/supabase-js'

const supabase = createClient()

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Error signing in:', error)
      return { user: null, error }
    }

    return { user: data.user, error: null }
  } catch (err) {
    console.error('Unexpected error during sign in:', err)
    return { 
      user: null, 
      error: { 
        message: 'Failed to connect to authentication service. Please check your network connection.' 
      } 
    }
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    return { error }
  }

  return { error: null }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }

  return user
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null)
  })
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.error('Error signing up:', error)
      return { user: null, error }
    }

    return { user: data.user, error: null }
  } catch (err) {
    console.error('Unexpected error during sign up:', err)
    return { 
      user: null, 
      error: { 
        message: 'Failed to connect to authentication service. Please check your network connection.' 
      } 
    }
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    })

    if (error) {
      console.error('Error sending reset password email:', error)
      return { error }
    }

    return { error: null }
  } catch (err) {
    console.error('Unexpected error during password reset:', err)
    return { 
      error: { 
        message: 'Failed to send reset password email. Please check your network connection.' 
      } 
    }
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('Error updating password:', error)
      return { error }
    }

    return { error: null }
  } catch (err) {
    console.error('Unexpected error during password update:', err)
    return { 
      error: { 
        message: 'Failed to update password. Please try again.' 
      } 
    }
  }
}

export async function resetPasswordWithOTP(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    })

    if (error) {
      console.error('Error sending reset password OTP:', error)
      return { error }
    }

    return { error: null }
  } catch (err) {
    console.error('Unexpected error during OTP password reset:', err)
    return { 
      error: { 
        message: 'Failed to send reset password OTP. Please check your network connection.' 
      } 
    }
  }
}

export async function verifyOTP(email: string, token: string, type: 'recovery' | 'signup' = 'recovery') {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type
    })

    if (error) {
      console.error('Error verifying OTP:', error)
      return { user: null, error }
    }

    return { user: data.user, error: null }
  } catch (err) {
    console.error('Unexpected error during OTP verification:', err)
    return { 
      user: null,
      error: { 
        message: 'Failed to verify OTP. Please try again.' 
      } 
    }
  }
}

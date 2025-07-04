import { createClient } from './supabase/server'
import { User } from '@supabase/supabase-js'

export async function getServerUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting server user:', error)
    return null
  }

  return user
}

export async function signInWithEmailServer(email: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Error signing in:', error)
    return { user: null, error }
  }

  return { user: data.user, error: null }
}

export async function signOutServer() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    return { error }
  }

  return { error: null }
}

export async function signUpWithEmailServer(email: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Error signing up:', error)
    return { user: null, error }
  }

  return { user: data.user, error: null }
}

export async function resetPasswordServer(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/reset-password`,
  })

  if (error) {
    console.error('Error sending reset password email:', error)
    return { error }
  }

  return { error: null }
}

export async function resetPasswordWithOTPServer(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/reset-password`,
    captchaToken: undefined // You can add captcha support later if needed
  })

  if (error) {
    console.error('Error sending reset password OTP:', error)
    return { error }
  }

  return { error: null }
}

export async function verifyOTPServer(email: string, token: string, type: 'recovery' | 'signup' = 'recovery') {
  const supabase = await createClient()
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
}

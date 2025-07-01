import { NextRequest, NextResponse } from 'next/server'
import { resetPasswordServer, resetPasswordWithOTPServer } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const { email, method = 'email' } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (method === 'otp') {
      const { error } = await resetPasswordWithOTPServer(email)
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ message: 'Password reset OTP sent to your email' })
    } else {
      const { error } = await resetPasswordServer(email)
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ message: 'Password reset email sent' })
    }
  } catch (error) {
    console.error('Error sending password reset:', error)
    return NextResponse.json({ error: 'Failed to send password reset' }, { status: 500 })
  }
}
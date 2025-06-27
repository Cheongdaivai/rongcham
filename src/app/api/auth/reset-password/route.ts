import { NextRequest, NextResponse } from 'next/server'
import { resetPasswordServer } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { error } = await resetPasswordServer(email)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Password reset email sent' })
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return NextResponse.json({ error: 'Failed to send password reset email' }, { status: 500 })
  }
}
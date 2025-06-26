import { NextRequest, NextResponse } from 'next/server'
import { signInWithEmailServer } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const { user, error } = await signInWithEmailServer(email, password)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error signing in:', error)
    return NextResponse.json({ error: 'Failed to sign in' }, { status: 500 })
  }
}

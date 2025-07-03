import { NextResponse } from 'next/server'
// import { NextRequest } from 'next/server' // Unused for now
import { signOutServer } from '@/lib/auth-server'

export async function POST() {
  try {
    const { error } = await signOutServer()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error signing out:', error)
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 })
  }
}

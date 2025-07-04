import { NextRequest, NextResponse } from 'next/server'
import { getPublicMenuItemsServer } from '@/lib/database-server'

interface RouteParams {
  params: {
    email: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const email = decodeURIComponent(params.email)
    
    console.log('🏪 Fetching menu for business email:', email)
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    
    // Get public menu items for this business
    const menuItems = await getPublicMenuItemsServer(email)
    
    console.log(`📦 Found ${menuItems.length} menu items for ${email}`)
    
    // Add cache-busting headers
    const response = NextResponse.json(menuItems)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    
    return response
  } catch (error) {
    console.error('❌ Error fetching menu items for business:', error)
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

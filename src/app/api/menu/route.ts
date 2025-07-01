import { NextRequest, NextResponse } from 'next/server'
import { getMenuItemsServer, getAllMenuItemsServer, createMenuItemServer, updateMenuItemServer, deleteMenuItemServer } from '@/lib/database-server'
import { getServerUser } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeUnavailable = searchParams.get('includeUnavailable') === 'true'
    
    let menuItems
    if (includeUnavailable) {
      // Admin access - get all items
      const user = await getServerUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      menuItems = await getAllMenuItemsServer()
    } else {
      // Public access - get only available items
      menuItems = await getMenuItemsServer()
    }
    
    return NextResponse.json(menuItems)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const menuItemData = await request.json()
    
    if (!menuItemData.name || !menuItemData.price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 })
    }

    const menuItem = await createMenuItemServer(menuItemData)
    
    if (!menuItem) {
      return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
    }

    return NextResponse.json(menuItem, { status: 201 })
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requestData = await request.json()
    console.log('PUT request data:', requestData)
    
    const { menu_id, ...updates } = requestData
    
    if (!menu_id) {
      return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 })
    }

    console.log('Updating menu item:', { menu_id, updates })
    console.log('Current user:', user.email)
    
    const updatedMenuItem = await updateMenuItemServer(menu_id, updates)
    
    console.log('Update result:', updatedMenuItem)
    
    if (!updatedMenuItem) {
      return NextResponse.json({ error: 'Failed to update menu item - no data returned from server' }, { status: 500 })
    }

    return NextResponse.json(updatedMenuItem)
  } catch (error) {
    console.error('Error updating menu item in API route:', error)
    return NextResponse.json({ error: `Failed to update menu item: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const menu_id = searchParams.get('menu_id')
    
    if (!menu_id) {
      return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 })
    }

    const success = await deleteMenuItemServer(menu_id)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 })
  }
}

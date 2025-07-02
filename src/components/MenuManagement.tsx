'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit3 } from 'lucide-react'
import { MenuItem } from '@/types'

interface MenuManagementProps {
  menuItems: MenuItem[]
  onItemCreated?: (item: MenuItem) => void
  onItemDeleted?: (itemId: string) => void
  onItemUpdated?: (item: MenuItem) => void
}

interface CreateMenuItemForm {
  name: string
  price: string
  description: string
  availability: boolean
}

export function MenuManagement({ menuItems, onItemCreated, onItemDeleted, onItemUpdated }: MenuManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<CreateMenuItemForm>({
    name: '',
    price: '',
    description: '',
    availability: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price) return

    setCreating(true)
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          availability: formData.availability
        })
      })

      if (response.ok) {
        const newItem = await response.json()
        onItemCreated?.(newItem)
        setFormData({ name: '', price: '', description: '', availability: true })
        setShowCreateForm(false)
      } else {
        const error = await response.json()
        alert(`Failed to create item: ${error.error}`)
      }
    } catch {
      alert('Network error occurred')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    setDeleting(itemId)
    try {
      const response = await fetch(`/api/menu?menu_id=${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onItemDeleted?.(itemId)
      } else {
        const error = await response.json()
        alert(`Failed to delete item: ${error.error}`)
      }
    } catch {
      alert('Network error occurred')
    } finally {
      setDeleting(null)
    }
  }

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const response = await fetch('/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_id: item.menu_id,
          availability: !item.availability
        })
      })

      if (response.ok) {
        const updatedItem = await response.json()
        onItemUpdated?.(updatedItem)
      } else {
        const error = await response.json()
        alert(`Failed to update item: ${error.error}`)
      }
    } catch {
      alert('Network error occurred')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Menu Management</h2>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-black text-white hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="p-6 border-2 border-black">
          <h3 className="text-lg font-semibold text-black mb-4">Create New Menu Item</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="e.g., Pad Thai"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="12.99"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 min-h-[80px]"
                placeholder="Describe the dish..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="availability"
                checked={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="availability" className="text-sm text-black">
                Available for ordering
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={creating || !formData.name || !formData.price}
                className="bg-black text-white hover:bg-gray-800"
              >
                {creating ? 'Creating...' : 'Create Item'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Menu Items List */}
      {menuItems.length === 0 ? (
        <Card className="p-6 border-2 border-black">
          <p className="text-gray-600 text-center">No menu items yet. Create your first item above!</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {menuItems.map((item) => (
            <Card key={item.menu_id} className="p-4 border-2 border-black">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black">{item.name}</h3>
                  <p className="text-gray-700 mt-1">{item.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-lg font-bold text-black">
                      ${item.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total ordered: {item.total_ordered || 0}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Badge 
                    className={item.availability 
                      ? 'bg-black text-white' 
                      : 'bg-gray-400 text-white'
                    }
                  >
                    {item.availability ? 'Available' : 'Unavailable'}
                  </Badge>
                  
                  <Button
                    size="sm"
                    onClick={() => toggleAvailability(item)}
                    className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => handleDelete(item.menu_id)}
                    disabled={deleting === item.menu_id}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 border-t pt-2">
                ID: {item.menu_id} | Created: {new Date(item.created_at).toLocaleDateString()}
                {item.created_by_email && ` | Created by: ${item.created_by_email}`}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
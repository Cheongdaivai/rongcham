'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MenuItem } from '@/types'
import { AlertTriangle } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  item: MenuItem | null
  isLoading?: boolean
}

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  item,
  isLoading = false 
}: DeleteConfirmModalProps) {
  if (!isOpen || !item) return null

  const handleConfirm = async () => {
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Error deleting menu item:', error)
      alert('Failed to delete menu item')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Delete Menu Item
          </h2>
          
          <p className="text-slate-600 mb-4">
            Are you sure you want to delete <strong>&quot;{item.name}&quot;</strong>? 
            This action cannot be undone.
          </p>
          
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-xl border-slate-300 hover:border-slate-400"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

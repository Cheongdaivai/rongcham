'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MenuItem } from '@/types'
import { X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react'

interface MenuItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (menuItem: Omit<MenuItem, 'menu_id' | 'created_at' | 'updated_at' | 'created_by_email'>) => Promise<void>
  editingItem?: MenuItem | null
  isLoading?: boolean
}

export default function MenuItemModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingItem,
  isLoading = false 
}: MenuItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    availability: true
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        description: editingItem.description || '',
        price: editingItem.price.toString(),
        image_url: editingItem.image_url || '',
        availability: editingItem.availability
      })
      setImagePreview(editingItem.image_url || '')
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        image_url: '',
        availability: true
      })
      setImagePreview('')
    }
    // Reset file states when modal opens/closes
    setImageFile(null)
  }, [editingItem, isOpen])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or WebP)')
        return
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        alert('File size must be less than 5MB')
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async (): Promise<string | null> => {
    if (!imageFile) return formData.image_url

    setUploadingImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', imageFile)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const { url } = await response.json()
      return url
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    setFormData(prev => ({ ...prev, image_url: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.price.trim()) {
      alert('Name and price are required')
      return
    }

    const price = parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price')
      return
    }

    try {
      // Upload image if a new file is selected
      let imageUrl = formData.image_url
      if (imageFile) {
        const uploadedUrl = await handleImageUpload()
        if (uploadedUrl === null) {
          return // Upload failed, stop submission
        }
        imageUrl = uploadedUrl
      }

      const menuItemData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        image_url: imageUrl || undefined,
        availability: formData.availability
      }
      
      await onSave(menuItemData)
      onClose()
    } catch (error) {
      console.error('Error saving menu item:', error)
      alert('Failed to save menu item')
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-300 hover:border-red-300 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter item name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter item description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Image
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4 relative">
                  <div className="w-full h-48 bg-slate-100 rounded-xl overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleRemoveImage}
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white border-red-300 hover:border-red-400 text-red-600 rounded-lg"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Upload Button */}
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 transition-colors"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      {imagePreview ? (
                        <>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Change Image
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </>
                      )}
                    </>
                  )}
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  JPEG, PNG, or WebP • Max 5MB
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="availability"
                checked={formData.availability}
                onChange={(e) => handleChange('availability', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="availability" className="ml-2 text-sm font-semibold text-slate-700">
                Available for ordering
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 rounded-xl border-slate-300 hover:border-slate-400"
                disabled={isLoading || uploadingImage}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                disabled={isLoading || uploadingImage}
              >
                {isLoading || uploadingImage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Saving...'}
                  </>
                ) : (
                  editingItem ? 'Update' : 'Add'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}

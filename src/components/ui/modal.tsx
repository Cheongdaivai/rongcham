'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { Button } from './button'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Handle mounting for SSR compatibility
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Handle modal visibility with smooth animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      document.body.style.overflow = 'hidden'
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200)
      document.body.style.overflow = 'unset'
      return () => clearTimeout(timer)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, handleEscape])

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  // Don't render on server or when not visible
  if (!mounted || !isVisible) return null

  const modalContent = (
    <div 
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center p-4
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        transition-all duration-300 ease-out
      `}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className={`
          absolute inset-0 bg-black/70 backdrop-blur-md
          ${isOpen ? 'opacity-100' : 'opacity-0'}
          transition-opacity duration-300 ease-out
        `}
      />
      
      {/* Modal Container - No Border Radius */}
      <div 
        className={`
          relative bg-white shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-slate-200
          ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
          transition-all duration-300 ease-out
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - No Border Radius */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 hover:bg-slate-100 transition-all duration-200 hover:scale-110 flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>
      </div>
    </div>
  )

  // Use portal to render modal at body level
  return createPortal(modalContent, document.body)
} 
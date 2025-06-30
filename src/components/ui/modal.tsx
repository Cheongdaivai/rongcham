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

  // Always render when mounted if modal should be visible or is animating out
  if (!mounted || (!isVisible && !isOpen)) return null

  const modalContent = (
    <div 
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center 
        p-2 sm:p-4 md:p-6 lg:p-8
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        transition-all duration-300 ease-out
        overflow-y-auto
      `}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-black/60 sm:bg-black/70 backdrop-blur-sm sm:backdrop-blur-md
          ${isOpen ? 'opacity-100' : 'opacity-0'}
          transition-opacity duration-300 ease-out
        `}
      />
      
      {/* Modal Container - Responsive Sizing */}
      <div 
        className={`
          relative bg-white shadow-lg sm:shadow-xl md:shadow-2xl 
          w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-xl xl:max-w-2xl
          border border-slate-200 
          ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
          transition-all duration-300 ease-out
          my-auto mx-auto
          max-h-[90vh] sm:max-h-[85vh] md:max-h-[90vh] lg:max-h-[95vh] 
          flex flex-col
          overflow-hidden
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Responsive */}
        {title && (
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 truncate pr-2">
              {title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11 hover:bg-slate-100 transition-all duration-200 hover:scale-110 flex-shrink-0 rounded-lg sm:rounded-xl"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </Button>
          </div>
        )}
        
        {/* Content - Responsive Padding */}
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          {children}
        </div>
      </div>
    </div>
  )

  // Use portal to render modal at body level
  return createPortal(modalContent, document.body)
} 
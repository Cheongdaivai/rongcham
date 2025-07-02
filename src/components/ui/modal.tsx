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
  const [showModal, setShowModal] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  // Handle mounting for SSR compatibility
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Enhanced animation handling with dramatic entrance
  useEffect(() => {
    if (isOpen) {
      setShowModal(true)
      document.body.style.overflow = 'hidden'
      // Double requestAnimationFrame for smooth entrance
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimateIn(true)
        })
      })
    } else {
      setAnimateIn(false)
      document.body.style.overflow = 'unset'
      // Hide modal after exit animation completes
      setTimeout(() => setShowModal(false), 800)
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

  // Don't render if not mounted or not showing
  if (!mounted || !showModal) return null

  const modalContent = (
    <>
      {/* Enhanced Backdrop with Dramatic Animation */}
      <div 
        className={`
          fixed inset-0 z-[9998] bg-black/70 backdrop-blur-md
          transition-all duration-700 ease-out
          ${animateIn ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleBackdropClick}
      />
      
      {/* Modal Container */}
      <div 
        className={`
          fixed inset-0 z-[9999] flex items-center justify-center 
          p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto
        `}
        onClick={handleBackdropClick}
      >
        {/* Main Modal with Dramatic Entrance */}
        <div 
          className={`
            relative bg-white shadow-2xl
            w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-xl xl:max-w-2xl
            border border-slate-200
            max-h-[90vh] sm:max-h-[85vh] md:max-h-[90vh] lg:max-h-[95vh] 
            flex flex-col overflow-hidden
            transform transition-all duration-1000 ease-out
            ${animateIn 
              ? 'scale-100 opacity-100 translate-y-0 rotate-0' 
              : 'scale-30 opacity-0 translate-y-40 rotate-20'
            }
          `}
          style={{
            transitionTimingFunction: animateIn 
              ? 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
              : 'cubic-bezier(0.55, 0.085, 0.68, 0.53)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Slide Animation */}
          {title && (
            <div className={`
              flex items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 
              border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white 
              flex-shrink-0
              transform transition-all duration-900 ease-out
              ${animateIn ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}
            `}
            style={{ transitionDelay: animateIn ? '300ms' : '0ms' }}
            >
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 truncate pr-2">
                {title}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={`
                  h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11 
                  hover:bg-slate-100 transition-all duration-300 hover:scale-110 
                  flex-shrink-0
                  transform
                  ${animateIn ? 'rotate-0 scale-100 opacity-100' : 'rotate-270 scale-25 opacity-0'}
                `}
                style={{ 
                  transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transitionDelay: animateIn ? '500ms' : '0ms' 
                }}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </Button>
            </div>
          )}
          
          {/* Content with Bounce-Up Animation */}
          <div className={`
            p-3 sm:p-4 md:p-5 lg:p-6 overflow-y-auto flex-1
            transform transition-all duration-1000 ease-out
            ${animateIn ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-80'}
          `}
          style={{ 
            transitionDelay: animateIn ? '400ms' : '0ms',
            transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Dramatic Floating Particles */}
      {animateIn && (
        <div className="fixed inset-0 z-[9997] pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-70" style={{ animationDelay: '0.6s', animationDuration: '2s' }} />
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.9s', animationDuration: '2.5s' }} />
          <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '1.2s', animationDuration: '2.2s' }} />
          <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '1.5s', animationDuration: '1.8s' }} />
          <div className="absolute bottom-1/4 right-1/5 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-55" style={{ animationDelay: '1.8s', animationDuration: '2.3s' }} />
        </div>
      )}

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        @keyframes dramaticBounceIn {
          0% {
            transform: scale(0.2) translateY(150px) rotate(20deg);
            opacity: 0;
          }
          30% {
            transform: scale(0.7) translateY(-30px) rotate(-5deg);
            opacity: 0.7;
          }
          60% {
            transform: scale(1.1) translateY(10px) rotate(2deg);
            opacity: 0.9;
          }
          80% {
            transform: scale(0.95) translateY(-5px) rotate(-1deg);
            opacity: 0.98;
          }
          100% {
            transform: scale(1) translateY(0px) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes smoothSlideOut {
          0% {
            transform: scale(1) translateY(0px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(0.7) translateY(80px) rotate(-8deg);
            opacity: 0;
          }
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.2);
          }
        }

        .modal-dramatic-entrance {
          animation: dramaticBounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .modal-smooth-exit {
          animation: smoothSlideOut 0.6s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
        }

        .particle-float {
          animation: particleFloat 3s ease-in-out infinite;
        }

        /* Enhanced scroll styling */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Smooth backdrop animation */
        .backdrop-animate {
          animation: backdropFade 0.7s ease-out forwards;
        }

        @keyframes backdropFade {
          0% {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          100% {
            opacity: 1;
            backdrop-filter: blur(8px);
          }
        }
      `}</style>
    </>
  )

  // Use portal to render modal at body level
  return createPortal(modalContent, document.body)
}
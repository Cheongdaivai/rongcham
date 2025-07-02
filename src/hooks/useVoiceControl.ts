'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// Define SpeechRecognition interface
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  start(): void
  stop(): void
  abort(): void
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition
}

interface VoiceControlState {
  isListening: boolean
  isSupported: boolean
  transcript: string
  error: string | null
  isKeywordActivated: boolean
}

interface UseVoiceControlOptions {
  activationKeywords?: string[]
  onCommand?: (command: string) => void
  onKeywordActivated?: () => void
  onKeywordDeactivated?: () => void
  continuous?: boolean
  language?: string
}

export function useVoiceControl(options: UseVoiceControlOptions = {}) {
  const {
    activationKeywords = ['hey restaurant', 'voice control', 'activate voice'],
    onCommand,
    onKeywordActivated,
    onKeywordDeactivated,
    continuous = true,
    language = 'en-US'
  } = options

  const [state, setState] = useState<VoiceControlState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    error: null,
    isKeywordActivated: false
  })

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Setup speech recognition event handlers
  const setupRecognitionHandlers = useCallback((recognition: SpeechRecognition) => {
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.lang = language

    recognition.onstart = () => {
      console.log('Speech recognition started')
      setState(prev => ({ ...prev, isListening: true, error: null }))
    }

    recognition.onend = () => {
      console.log('Speech recognition ended')
      setState(prev => ({ ...prev, isListening: false }))
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      setState(prev => ({ 
        ...prev, 
        error: `Speech recognition error: ${event.error}`,
        isListening: false 
      }))
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      const currentTranscript = finalTranscript || interimTranscript
      setState(prev => ({ ...prev, transcript: currentTranscript }))

      // Use current state via callback to avoid stale closure
      setState(currentState => {
        // Check for activation keywords
        if (!currentState.isKeywordActivated) {
          const lowerTranscript = currentTranscript.toLowerCase()
          const keywordDetected = activationKeywords.some(keyword => 
            lowerTranscript.includes(keyword.toLowerCase())
          )

          if (keywordDetected && finalTranscript) {
            onKeywordActivated?.()
            
            // Set timeout to deactivate after 30 seconds of inactivity
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => {
              setState(prev => ({ ...prev, isKeywordActivated: false }))
              onKeywordDeactivated?.()
            }, 30000)

            return { ...currentState, isKeywordActivated: true }
          }
        } else {
          // Process command if keyword is activated
          if (finalTranscript && onCommand) {
            onCommand(finalTranscript.trim())
            
            // Reset timeout
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => {
              setState(prev => ({ ...prev, isKeywordActivated: false }))
              onKeywordDeactivated?.()
            }, 30000)
          }
        }
        return currentState
      })
    }
  }, [activationKeywords, onCommand, onKeywordActivated, onKeywordDeactivated, continuous, language])

  // Check if Web Speech API is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setState(prev => ({ ...prev, isSupported: true }))
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      setupRecognitionHandlers(recognition)
    } else {
      setState(prev => ({ 
        ...prev, 
        isSupported: false, 
        error: 'Speech recognition not supported in this browser' 
      }))
    }
  }, [setupRecognitionHandlers])

  // Update recognition handlers when dependencies change
  useEffect(() => {
    if (recognitionRef.current) {
      setupRecognitionHandlers(recognitionRef.current)
    }
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [setupRecognitionHandlers])

  const requestMicrophonePermission = useCallback(async () => {
    try {
      console.log('Requesting microphone permission...')
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Permission granted, stop the stream as we only needed it for permission
      stream.getTracks().forEach(track => track.stop())
      
      console.log('Microphone permission granted')
      return true
    } catch (error) {
      console.error('Microphone permission denied:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Microphone permission denied. Please allow microphone access to use voice control.' 
      }))
      return false
    }
  }, [])

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || !state.isSupported) {
      console.warn('Cannot start listening: Recognition not supported or not available')
      return
    }

    // Request microphone permission first
    const permissionGranted = await requestMicrophonePermission()
    if (!permissionGranted) {
      console.warn('Cannot start listening: Microphone permission denied')
      return
    }

    try {
      // Stop any existing recognition first
      recognitionRef.current.stop()
      
      // Small delay to ensure previous recognition is fully stopped
      setTimeout(() => {
        if (recognitionRef.current) {
          console.log('Starting speech recognition...')
          recognitionRef.current.start()
        }
      }, 100)
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      setState(prev => ({ 
        ...prev, 
        error: `Failed to start listening: ${error}`,
        isListening: false 
      }))
    }
  }, [state.isSupported, requestMicrophonePermission])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return

    recognitionRef.current.stop()
    setState(prev => ({ ...prev, isKeywordActivated: false }))
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    onKeywordDeactivated?.()
  }, [onKeywordDeactivated])

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [state.isListening, startListening, stopListening])

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor
    webkitSpeechRecognition: SpeechRecognitionConstructor
  }
}
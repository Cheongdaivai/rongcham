'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Volume2 } from 'lucide-react'

interface VoiceControlProps {
  onTranscriptChange?: (transcript: string) => void
  onCommandProcessed?: (command: string, result: any) => void
  autoStart?: boolean // New prop to control auto-starting
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: any) => any) | null
}

type ListeningState = 'waiting-for-keyword' | 'listening-for-command'

export function EnhancedVoiceControl({ onTranscriptChange, onCommandProcessed, autoStart = false }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [listeningState, setListeningState] = useState<ListeningState>('waiting-for-keyword')

  // Update ref whenever state changes
  useEffect(() => {
    listeningStateRef.current = listeningState
  }, [listeningState])
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [commandTranscript, setCommandTranscript] = useState('') // The command after "Hey RC"
  const [lastCommand, setLastCommand] = useState('')
  const [commandResult, setCommandResult] = useState('')
  const [aiStatus, setAiStatus] = useState<'checking' | 'available' | 'unavailable'>('checking')
  const [aiModel, setAiModel] = useState('')
  const [lastAnalysis, setLastAnalysis] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied' | 'prompt'>('checking')
  const [showPermissionDialog, setShowPermissionDialog] = useState(false)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const listeningStateRef = useRef<ListeningState>('waiting-for-keyword')

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${info}`])
  }

  useEffect(() => {
    addDebugInfo('Initializing voice control...')
    
    // Check HTTPS requirement
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
    addDebugInfo(`HTTPS Status: ${isSecure ? 'Secure' : 'Not Secure (Required)'}`)
    
    // Detailed browser detection
    const userAgent = navigator.userAgent
    const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor)
    const isFirefox = /Firefox/.test(userAgent)
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
    const isEdge = /Edg/.test(userAgent)
    
    addDebugInfo(`Browser: ${isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : isEdge ? 'Edge' : 'Unknown'}`)
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const speechSynthesis = window.speechSynthesis

    addDebugInfo(`SpeechRecognition available: ${!!SpeechRecognition}`)
    addDebugInfo(`SpeechSynthesis available: ${!!speechSynthesis}`)

    if (SpeechRecognition && speechSynthesis && isSecure) {
      setIsSupported(true)
      synthRef.current = speechSynthesis
      addDebugInfo('Voice control supported')
      // Don't request permission immediately, wait for user action
      setPermissionStatus('prompt')
    } else {
      setIsSupported(false)
      if (!isSecure) {
        addDebugInfo('ERROR: HTTPS required for voice recognition')
      }
      if (!SpeechRecognition) {
        if (isFirefox) {
          addDebugInfo('ERROR: Firefox has limited Web Speech API support')
          addDebugInfo('TIP: Enable media.webspeech.recognition.enable in about:config')
          addDebugInfo('TIP: Or use Chrome/Edge for better compatibility')
        } else {
          addDebugInfo('ERROR: Web Speech API not supported in this browser')
          addDebugInfo('TIP: Use Chrome, Edge, or Safari')
        }
      }
    }

    checkAIStatus()
  }, [])

  // Auto-start effect when component mounts and autoStart is true
  useEffect(() => {
    if (autoStart && isSupported && aiStatus === 'available' && !isListening && permissionStatus === 'prompt') {
      addDebugInfo('Auto-start enabled, showing permission dialog...')
      setShowPermissionDialog(true)
    }
  }, [autoStart, isSupported, aiStatus, isListening, permissionStatus])

  const handlePermissionRequest = async () => {
    setShowPermissionDialog(false)
    addDebugInfo('User requested microphone permission...')
    
    try {
      const permissionGranted = await requestMicrophonePermission()
      if (permissionGranted) {
        addDebugInfo('Auto-starting voice control...')
        await startListening()
      } else {
        addDebugInfo('Auto-start failed: Permission denied')
      }
    } catch (error) {
      addDebugInfo(`Auto-start error: ${error}`)
    }
  }

  const handlePermissionDecline = () => {
    setShowPermissionDialog(false)
    addDebugInfo('User declined microphone permission')
  }

  const requestMicrophonePermission = async () => {
    try {
      addDebugInfo('Requesting microphone permission...')
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Permission granted, stop the stream as we only needed it for permission
      stream.getTracks().forEach(track => track.stop())
      
      setPermissionStatus('granted')
      addDebugInfo('Microphone permission granted')
      return true
    } catch (error) {
      addDebugInfo(`Microphone permission denied: ${error}`)
      setPermissionStatus('denied')
      return false
    }
  }

  const checkAIStatus = async () => {
    try {
      const response = await fetch('/api/ai/status')
      const data = await response.json()
      // Use the status field if available, otherwise fallback to available check
      const status = data.status || (data.available ? 'available' : 'unavailable')
      setAiStatus(status)
      setAiModel(data.model || 'Unknown')
    } catch (err) {
      setAiStatus('unavailable')
      setAiModel('Error')
    }
  }

  const initializeSpeechRecognition = () => {
    if (!isSupported) {
      addDebugInfo('Cannot initialize: not supported')
      return null
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        addDebugInfo('SpeechRecognition constructor not available')
        return null
      }

      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        addDebugInfo('Speech recognition started')
        setIsListening(true)
      }

      recognition.onend = () => {
        addDebugInfo('Speech recognition ended')
        setIsListening(false)
      }

      recognition.onerror = (event: any) => {
        addDebugInfo(`Speech error: ${event.error}`)
        console.error('Speech recognition error:', event.error, event)
        setIsListening(false)
        
        // Handle specific errors
        if (event.error === 'not-allowed') {
          setPermissionStatus('denied')
          addDebugInfo('Microphone permission denied')
        } else if (event.error === 'no-speech') {
          addDebugInfo('No speech detected')
        } else if (event.error === 'audio-capture') {
          addDebugInfo('Audio capture failed - check microphone')
        } else if (event.error === 'network') {
          addDebugInfo('Network error - check internet connection')
        } else if (event.error === 'aborted') {
          addDebugInfo('Recognition aborted')
        }
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        
        const lowerTranscript = transcript.toLowerCase().trim()
        
        // Always log what we hear for debugging
        addDebugInfo(`RAW AUDIO: "${transcript}" (State: ${listeningStateRef.current})`)
        
        if (listeningStateRef.current === 'waiting-for-keyword') {
          // Check for "System" keyword with variations
          const keywordVariations = ['system', 'sistem', 'systems']
          const foundKeyword = keywordVariations.find(keyword => lowerTranscript.includes(keyword))
          
          if (foundKeyword) {
            addDebugInfo(`KEYWORD MATCH: Found "${foundKeyword}" in "${transcript}"`)
            // Extract only the part AFTER the found keyword
            const keywordIndex = lowerTranscript.indexOf(foundKeyword)
            const afterKeyword = transcript.substring(transcript.toLowerCase().indexOf(foundKeyword) + foundKeyword.length).trim()
            
            addDebugInfo(`Keyword detected in: "${transcript}"`)
            addDebugInfo(`Command part after "System": "${afterKeyword}"`)
            addDebugInfo('Switching to command mode')
            
            setListeningState('listening-for-command')
            setCommandTranscript('') // Clear previous command
            
            // Only show the part after "System" 
            setCurrentTranscript(afterKeyword)
            onTranscriptChange?.(afterKeyword)
            
            // Set the initial command to only what came after "System"
            if (afterKeyword) {
              setCommandTranscript(afterKeyword)
              addDebugInfo(`Command started: "${afterKeyword}"`)
            }
            
            // Check if "over" is also in this same utterance (after System)
            if (afterKeyword.toLowerCase().includes('over')) {
              handleCommandComplete(afterKeyword)
            }
          } else {
            // Don't show transcript for non-keyword speech
            setCurrentTranscript('')
            addDebugInfo(`NO KEYWORD: "${transcript}" - waiting for System`)
            // Don't call onTranscriptChange to avoid showing unwanted speech
          }
        } else if (listeningStateRef.current === 'listening-for-command') {
          // In command mode, show all speech
          setCurrentTranscript(transcript)
          onTranscriptChange?.(transcript)
          addDebugInfo(`Command audio: "${transcript}"`)
          
          // Accumulate command text
          setCommandTranscript(prev => {
            const updated = prev + ' ' + transcript
            addDebugInfo(`Command building: "${updated.trim()}"`)
            return updated.trim()
          })
          
          // Check for "over" to complete command
          if (lowerTranscript.includes('over')) {
            handleCommandComplete(commandTranscript + ' ' + transcript)
          }
        }
      }

      addDebugInfo('Recognition initialized successfully')
      return recognition
    } catch (error) {
      addDebugInfo(`Failed to initialize recognition: ${error}`)
      console.error('Failed to initialize speech recognition:', error)
      return null
    }
  }

  const handleCommandComplete = (fullCommand: string) => {
    // Remove "over" from the end of the command
    const cleanCommand = fullCommand.replace(/\bover\b/gi, '').trim()
    
    addDebugInfo(`Command completed: "${cleanCommand}"`)
    addDebugInfo('Returning to keyword waiting state')
    
    // Reset to waiting for keyword state
    setListeningState('waiting-for-keyword')
    setCommandTranscript('')
    
    // Process the command
    if (cleanCommand) {
      processVoiceCommand(cleanCommand)
    }
  }

  const processVoiceCommand = async (command: string) => {
    setLastCommand(command)
    setCommandResult('Processing with AI...')
    
    try {
      const response = await fetch('/api/ai/process-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setCommandResult(data.response)
        setLastAnalysis(data.analysis)
        speak(data.response)
        onCommandProcessed?.(command, data)
      } else {
        const errorMsg = data.error || 'Failed to process command'
        setCommandResult(`Error: ${errorMsg}`)
        setLastAnalysis(null)
        speak(errorMsg)
      }
    } catch (err) {
      console.error('Voice command processing error:', err)
      const errorMsg = 'Sorry, I could not process that command.'
      setCommandResult(errorMsg)
      speak(errorMsg)
    }
  }

  const speak = (text: string) => {
    if (!synthRef.current) return

    synthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8
    
    synthRef.current.speak(utterance)
  }

  const startListening = async () => {
    addDebugInfo('Start listening clicked')
    
    if (!isSupported) {
      addDebugInfo('Cannot start: Speech recognition not supported')
      return
    }

    // Request microphone permission if not already granted
    if (permissionStatus !== 'granted') {
      addDebugInfo('Requesting microphone permission...')
      const permissionGranted = await requestMicrophonePermission()
      
      if (!permissionGranted) {
        addDebugInfo('Cannot start: Microphone permission denied')
        alert('Microphone permission is required for voice control. Please allow microphone access and try again.')
        return
      }
    }

    try {
      if (recognitionRef.current) {
        addDebugInfo('Stopping existing recognition')
        recognitionRef.current.stop()
        recognitionRef.current = null
      }

      addDebugInfo('Initializing new recognition instance')
      const newRecognition = initializeSpeechRecognition()
      
      if (newRecognition) {
        recognitionRef.current = newRecognition
        addDebugInfo('Starting speech recognition...')
        newRecognition.start()
        setCurrentTranscript('')
        setCommandTranscript('')
        setCommandResult('')
      } else {
        addDebugInfo('Failed to initialize recognition')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      addDebugInfo(`Error in startListening: ${errorMessage}`)
      console.error('Error starting speech recognition:', error)
      
      // Handle specific Chrome errors
      if (errorMessage.includes('already started')) {
        addDebugInfo('Recognition already started, attempting to restart...')
        setTimeout(() => {
          try {
            if (recognitionRef.current) {
              recognitionRef.current.start()
            }
          } catch (retryError) {
            addDebugInfo(`Retry failed: ${retryError}`)
          }
        }, 500)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const clearTranscript = () => {
    setCurrentTranscript('')
    setCommandTranscript('')
    setLastCommand('')
    setCommandResult('')
    setLastAnalysis(null)
    setListeningState('waiting-for-keyword')
    addDebugInfo('Transcript cleared, reset to waiting for System')
  }

  return (
    <Card className="p-6 border-2 border-black">
      {/* Permission Request Dialog */}
      {showPermissionDialog && (
        <div className="mb-4 bg-blue-50 border-2 border-blue-200 rounded-md p-4">
          <h4 className="font-semibold text-blue-800 mb-2">🎤 Voice Control Setup</h4>
          <p className="text-sm text-blue-700 mb-3">
            Voice control is ready! Click "Allow Microphone" to enable voice commands for managing your restaurant orders.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handlePermissionRequest}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Allow Microphone
            </Button>
            <Button
              onClick={handlePermissionDecline}
              className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            >
              Not Now
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black">AI Voice Control</h3>
          <div className="flex items-center gap-2">
            <Badge className={isSupported ? "bg-black text-white" : "bg-gray-400 text-white"}>
              {isSupported ? "Supported" : "Not Supported"}
            </Badge>
            <Badge className={aiStatus === 'available' ? "bg-black text-white" : "bg-gray-400 text-white"}>
              {aiModel}: {aiStatus}
            </Badge>
          </div>
        </div>

        {/* Browser compatibility warning */}
        {!isSupported && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-md p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Browser Compatibility Issue</h4>
            <p className="text-sm text-yellow-700 mb-2">
              Voice control is not supported in your current browser configuration.
            </p>
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">Recommended browsers:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Google Chrome (best support)</li>
                <li>Microsoft Edge</li>
                <li>Safari (macOS/iOS)</li>
              </ul>
              <p className="mt-2 font-medium">Firefox users:</p>
              <p className="ml-4">Enable <code className="bg-yellow-100 px-1 rounded">media.webspeech.recognition.enable</code> in about:config</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={!isSupported || aiStatus === 'unavailable'}
            className={`${isListening 
              ? 'bg-black text-white hover:bg-gray-800' 
              : 'bg-white text-black border-2 border-black hover:bg-black hover:text-white'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Button>
          
          <Button
            onClick={clearTranscript}
            className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
          >
            Clear
          </Button>
          
          <Button
            onClick={() => speak("Voice control system is ready")}
            disabled={!synthRef.current}
            className="bg-white text-black border-2 border-black hover:bg-black hover:text-white"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Test Speech
          </Button>
        </div>

        {/* Current State Display */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-black">Current State:</label>
            <div className="mt-1 p-3 bg-gray-100 border-2 border-gray-300 rounded-md">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium text-black">
                  {!isListening ? 'Not Listening' : 
                   listeningState === 'waiting-for-keyword' ? 'Waiting for "System"' : 
                   'Listening for Command (say "Over" to complete)'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-black">Live Audio:</label>
            <div className="mt-1 p-3 bg-gray-100 border-2 border-gray-300 rounded-md min-h-[60px]">
              <p className="text-sm text-black font-mono">
                {currentTranscript || 
                 (!isListening ? "Click 'Start Listening' to begin" :
                  listeningState === 'waiting-for-keyword' ? 'Listening for "System"...' :
                  "Listening for command...")}
              </p>
            </div>
          </div>

          {commandTranscript && listeningState === 'listening-for-command' && (
            <div>
              <label className="text-sm font-medium text-black">Current Command:</label>
              <div className="mt-1 p-3 bg-blue-100 border-2 border-blue-300 rounded-md">
                <p className="text-sm text-blue-900 font-mono">
                  {commandTranscript}
                  <span className="text-blue-600"> (say "Over" to complete)</span>
                </p>
              </div>
            </div>
          )}

          {lastCommand && (
            <div>
              <label className="text-sm font-medium text-black">Last Command:</label>
              <div className="mt-1 p-3 bg-black text-white rounded-md">
                <p className="text-sm font-mono">{lastCommand}</p>
              </div>
            </div>
          )}

          {commandResult && (
            <div>
              <label className="text-sm font-medium text-black">AI Response:</label>
              <div className="mt-1 p-3 bg-white border-2 border-black rounded-md">
                <p className="text-sm text-black">{commandResult}</p>
              </div>
            </div>
          )}

          {lastAnalysis && (
            <div>
              <label className="text-sm font-medium text-black">AI Analysis:</label>
              <div className="mt-1 p-3 bg-gray-100 border-2 border-gray-300 rounded-md">
                <div className="text-xs space-y-1">
                  <p><strong>Intent:</strong> {lastAnalysis.intent}</p>
                  <p><strong>Confidence:</strong> {(lastAnalysis.confidence * 100).toFixed(1)}%</p>
                  {lastAnalysis.entities && Object.keys(lastAnalysis.entities).length > 0 && (
                    <p><strong>Entities:</strong> {JSON.stringify(lastAnalysis.entities)}</p>
                  )}
                  <p><strong>Action:</strong> {lastAnalysis.suggestedAction}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Debug Information */}
        {debugInfo.length > 0 && (
          <div className="pt-4 border-t-2 border-gray-200">
            <p className="text-sm font-medium text-black mb-2">Debug Information:</p>
            <div className="bg-gray-100 border-2 border-gray-300 rounded-md p-3 max-h-32 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-xs text-gray-700 font-mono mb-1">
                  {info}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Permission Status */}
        {permissionStatus !== 'checking' && (
          <div className="pt-2">
            <p className="text-sm font-medium text-black mb-2">Status:</p>
            <div className="flex gap-2">
              <Badge className={permissionStatus === 'granted' ? "bg-black text-white" : "bg-gray-400 text-white"}>
                Microphone: {permissionStatus}
              </Badge>
              <Badge className={isSupported ? "bg-black text-white" : "bg-gray-400 text-white"}>
                Browser: {isSupported ? 'Supported' : 'Not Supported'}
              </Badge>
            </div>
          </div>
        )}

        {/* Command Examples */}
        <div className="pt-4 border-t-2 border-gray-200">
          <p className="text-sm font-medium text-black mb-2">Voice Command Examples:</p>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-md p-3 mb-3">
            <p className="text-sm font-medium text-yellow-800 mb-1">How it works:</p>
            <ol className="text-xs text-yellow-700 list-decimal list-inside space-y-1">
              <li>Say <strong>"System"</strong> to activate command mode</li>
              <li>Speak your command</li>
              <li>Say <strong>"Over"</strong> to complete and send the command</li>
            </ol>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs text-gray-700">
            <div>• "System, how many pending orders? Over."</div>
            <div>• "System, mark order 7 as done. Over."</div>
            <div>• "System, set order 5 to cancelled. Over."</div>
            <div>• "System, what are our popular items? Over."</div>
            <div>• "System, show me today's revenue. Over."</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
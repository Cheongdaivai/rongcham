'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVoiceControl } from '@/hooks/useVoiceControl'
import { aiVoiceCommandProcessor, AIVoiceCommandResult } from '@/lib/aiVoiceCommands'

interface AIVoiceControlProps {
  onCommandResult?: (result: AIVoiceCommandResult) => void
}

export function AIVoiceControl({ onCommandResult }: AIVoiceControlProps) {
  const [commandResult, setCommandResult] = useState<AIVoiceCommandResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [isApiKeySet, setIsApiKeySet] = useState(false)

  // Check if Gemini API key is configured
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const response = await fetch('/api/ai/status')
        if (response.ok) {
          const data = await response.json()
          setIsApiKeySet(data.geminiConfigured)
        }
      } catch (error) {
        console.error('Failed to check AI status:', error)
        setIsApiKeySet(false)
      }
    }
    
    checkAIStatus()
  }, [])

  const speakResponse = (text: string) => {
    if (!speechEnabled || !window.speechSynthesis) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8
    
    // Try to use a pleasant voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Female') || voice.name.includes('Google'))
    )
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    window.speechSynthesis.speak(utterance)
  }

  const handleCommand = async (command: string) => {
    setIsProcessing(true)
    try {
      const result = await aiVoiceCommandProcessor.processCommand(command)
      setCommandResult(result)
      onCommandResult?.(result)

      // Speak the AI-generated response
      if (result.smartResponse) {
        speakResponse(result.smartResponse)
      }
    } catch (error) {
      const errorResult: AIVoiceCommandResult = {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        smartResponse: "I'm sorry, I encountered an error. Please try again.",
        confidence: 0
      }
      setCommandResult(errorResult)
      speakResponse(errorResult.smartResponse)
    } finally {
      setIsProcessing(false)
    }
  }

  const {
    isListening,
    isSupported,
    transcript,
    error,
    isKeywordActivated,
    toggleListening
  } = useVoiceControl({
    activationKeywords: ['hey restaurant', 'voice control', 'activate voice'],
    onCommand: handleCommand,
    onKeywordActivated: () => {
      setCommandResult(null)
      if (speechEnabled) {
        speakResponse("Voice control activated. How can I help you?")
      }
    },
    onKeywordDeactivated: () => {
      if (speechEnabled) {
        speakResponse("Voice control deactivated.")
      }
    }
  })

  if (!isSupported) {
    return (
      <Card className="p-4 bg-red-50 border-red-200">
        <p className="text-red-700">
          Voice control is not supported in this browser. 
          Please use Chrome, Firefox, or Safari for voice features.
        </p>
      </Card>
    )
  }

  if (!isApiKeySet) {
    return (
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">AI Voice Control Setup Required</h3>
        <p className="text-yellow-700 text-sm">
          To use AI-powered voice control, please set your Gemini API key in the environment variables:
        </p>
        <code className="block mt-2 p-2 bg-yellow-100 rounded text-xs">
          GEMINI_API_KEY=your_api_key_here
        </code>
        <p className="text-yellow-600 text-xs mt-2">
          Get your API key from: <a href="https://ai.google.dev/" target="_blank" className="underline">Google AI Studio</a>
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          🤖 AI Voice Control
          <Badge variant="outline" className="text-xs">Powered by Gemini</Badge>
        </h3>
        <div className="flex items-center space-x-2">
          {isKeywordActivated && (
            <Badge className="bg-green-100 text-green-800 animate-pulse">
              🎤 Active
            </Badge>
          )}
          <Button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            variant="outline"
            size="sm"
            title={speechEnabled ? "Disable voice responses" : "Enable voice responses"}
          >
            {speechEnabled ? "🔊" : "🔇"}
          </Button>
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            size="sm"
          >
            {isListening ? "Stop Listening" : "Start Listening"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <div className="text-sm text-gray-600">
          <strong>Status:</strong>{' '}
          {isListening ? (
            <span className="text-green-600">
              {isKeywordActivated ? '🎯 Ready for commands' : '👂 Listening for "Hey restaurant"'}
            </span>
          ) : (
            <span className="text-gray-500">💤 Not listening</span>
          )}
        </div>

        {transcript && (
          <div className="p-2 bg-gray-50 rounded text-sm">
            <strong>You said:</strong> &quot;{transcript}&quot;
          </div>
        )}

        {isProcessing && (
          <div className="p-2 bg-blue-50 rounded text-sm text-blue-700 flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            AI is thinking...
          </div>
        )}

        {commandResult && (
          <div className={`p-3 rounded text-sm ${
            commandResult.success 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">
                {commandResult.success ? '✅ Success' : '❌ Error'}
              </div>
              {commandResult.confidence !== undefined && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(commandResult.confidence * 100)}% confident
                </Badge>
              )}
            </div>
            
            {commandResult.analysis && (
              <div className="text-xs mb-2 opacity-75">
                Intent: {commandResult.analysis.intent} | 
                Action: {commandResult.analysis.suggestedAction}
              </div>
            )}
            
            <div className="whitespace-pre-line font-medium">
              🤖 {commandResult.smartResponse}
            </div>
            
            {commandResult.message !== commandResult.smartResponse && (
              <div className="mt-2 text-xs opacity-75">
                Technical: {commandResult.message}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">🎯 AI-Powered Commands:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>💬 <strong>Natural Language:</strong> Speak normally - AI understands context!</div>
          <div className="ml-4 space-y-1">
            <div>• &quot;Please mark order 123 as completed&quot;</div>
            <div>• &quot;How many pending orders are there?&quot;</div>
            <div>• &quot;What&apos;s our most popular dish today?&quot;</div>
            <div>• &quot;Set order 456 to cancelled please&quot;</div>
            <div>• &quot;Show me the menu statistics&quot;</div>
          </div>
          <div className="pt-2 text-xs">
            <div>1. Say &quot;Hey restaurant&quot; to activate</div>
            <div>2. Speak your command naturally</div>
            <div>3. AI will understand and execute</div>
            <div>4. Listen for voice confirmation</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVoiceControl } from '@/hooks/useVoiceControl'
import { voiceCommandProcessor, VoiceCommandResult } from '@/lib/voiceCommands'

interface VoiceControlProps {
  onCommandResult?: (result: VoiceCommandResult) => void
}

export function VoiceControl({ onCommandResult }: VoiceControlProps) {
  const [commandResult, setCommandResult] = useState<VoiceCommandResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCommand = async (command: string) => {
    setIsProcessing(true)
    try {
      const result = await voiceCommandProcessor.processCommand(command)
      setCommandResult(result)
      onCommandResult?.(result)
    } catch (error) {
      setCommandResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
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
    startListening,
    stopListening,
    toggleListening
  } = useVoiceControl({
    activationKeywords: ['hey restaurant', 'voice control', 'activate voice'],
    onCommand: handleCommand,
    onKeywordActivated: () => {
      setCommandResult(null)
      console.log('Voice control activated')
    },
    onKeywordDeactivated: () => {
      console.log('Voice control deactivated')
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

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Voice Control</h3>
        <div className="flex items-center space-x-2">
          {isKeywordActivated && (
            <Badge className="bg-green-100 text-green-800 animate-pulse">
              Active
            </Badge>
          )}
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
              {isKeywordActivated ? 'Listening for commands' : 'Listening for activation keyword'}
            </span>
          ) : (
            <span className="text-gray-500">Not listening</span>
          )}
        </div>

        {transcript && (
          <div className="p-2 bg-gray-50 rounded text-sm">
            <strong>Heard:</strong> "{transcript}"
          </div>
        )}

        {isProcessing && (
          <div className="p-2 bg-blue-50 rounded text-sm text-blue-700">
            Processing command...
          </div>
        )}

        {commandResult && (
          <div className={`p-3 rounded text-sm ${
            commandResult.success 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <div className="font-medium">
              {commandResult.success ? '✅ Success' : '❌ Error'}
            </div>
            <div className="mt-1 whitespace-pre-line">
              {commandResult.message}
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">How to use:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>1. Click "Start Listening" to begin</div>
          <div>2. Say "Hey restaurant" to activate voice control</div>
          <div>3. Give commands like:</div>
          <div className="ml-4 space-y-1">
            <div>• "Mark order 123 as done"</div>
            <div>• "How many pending orders?"</div>
            <div>• "Show popular items"</div>
            <div>• "Help" for more commands</div>
          </div>
          <div>4. Voice control stays active for 30 seconds</div>
        </div>
      </div>
    </Card>
  )
}
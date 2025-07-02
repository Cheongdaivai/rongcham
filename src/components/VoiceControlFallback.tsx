'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Keyboard } from 'lucide-react';

interface VoiceControlFallbackProps {
  onTranscriptChange?: (transcript: string) => void;
  onCommandProcessed?: (command: string, result: any) => void;
}

export function VoiceControlFallback({ onTranscriptChange, onCommandProcessed }: VoiceControlFallbackProps) {
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [commandResult, setCommandResult] = useState('');
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);

  const processTextCommand = async (command: string) => {
    setLastCommand(command);
    setCommandResult('Processing with AI...');
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/ai/process-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCommandResult(data.response);
        setLastAnalysis(data.analysis);
        onCommandProcessed?.(command, data);
      } else {
        const errorMsg = data.error || 'Failed to process command';
        setCommandResult(`Error: ${errorMsg}`);
        setLastAnalysis(null);
      }
    } catch (err) {
      console.error('Text command processing error:', err);
      const errorMsg = 'Sorry, I could not process that command.';
      setCommandResult(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      processTextCommand(textInput.trim());
      setTextInput('');
    }
  };

  const handleExampleCommand = (command: string) => {
    setTextInput(command);
  };

  return (
    <Card className="p-6 border-2 border-black">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black">Text-Based AI Control</h3>
          <Badge className="bg-black text-white">
            <Keyboard className="w-4 h-4 mr-1" />
            Text Mode
          </Badge>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-md p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Voice Control Alternative</h4>
          <p className="text-sm text-blue-700">
            Since voice recognition isn't available in your browser, you can type commands instead.
            All the same AI features are available through text input.
          </p>
        </div>

        {/* Text Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Type your command here (e.g., 'How many pending orders?')"
              value={textInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTextInput(e.target.value)}
              className="flex-1"
              disabled={isProcessing}
            />
            <Button 
              type="submit" 
              disabled={!textInput.trim() || isProcessing}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isProcessing ? 'Processing...' : 'Send'}
            </Button>
          </div>
        </form>

        {/* Example Commands */}
        <div>
          <p className="text-sm font-medium text-black mb-2">Quick Commands:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'How many pending orders?',
              'Mark order 123 as done',
              'Show popular items',
              'What\'s today\'s revenue?'
            ].map((command) => (
              <Button
                key={command}
                variant="outline"
                size="sm"
                onClick={() => handleExampleCommand(command)}
                className="text-xs"
                disabled={isProcessing}
              >
                {command}
              </Button>
            ))}
          </div>
        </div>

        {/* Command Results */}
        <div className="space-y-3">
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

        {/* Command Examples */}
        <div className="pt-4 border-t-2 border-gray-200">
          <p className="text-sm font-medium text-black mb-2">Text Command Examples:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
            <div>• "How many pending orders?"</div>
            <div>• "Mark order 123 as done"</div>
            <div>• "What are our popular items?"</div>
            <div>• "Show me today's revenue"</div>
            <div>• "List all preparing orders"</div>
            <div>• "Help" for more commands</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

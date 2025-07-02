'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SimpleVoiceTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const log = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev.slice(-20), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    log('Page loaded, checking voice support...');
    
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      log('Running on server side, skipping voice check');
      return;
    }

    log('Client side detected, checking APIs...');
    
    // Check Speech APIs
    log(`window.SpeechRecognition exists: ${!!(window as any).SpeechRecognition}`);
    log(`window.webkitSpeechRecognition exists: ${!!(window as any).webkitSpeechRecognition}`);
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    log(`Combined SpeechRecognition: ${!!SpeechRecognition}`);
    
    // Check protocol
    log(`Protocol: ${window.location.protocol}`);
    log(`Hostname: ${window.location.hostname}`);
    
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    log(`Is secure context: ${isSecure}`);
    
    // Browser info
    log(`User Agent: ${navigator.userAgent}`);
    
    // Final support check
    const supported = !!(SpeechRecognition && isSecure);
    log(`Voice control supported: ${supported}`);
    setIsSupported(supported);
    
  }, []);

  const testVoiceControl = async () => {
    log('Test voice control clicked');
    
    if (!isSupported) {
      log('Voice control not supported');
      return;
    }

    try {
      log('Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      log('Microphone permission granted');
      
      // Stop the stream
      stream.getTracks().forEach(track => track.stop());
      log('Microphone stream stopped');
      
      // Try to create speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      log('Speech recognition instance created');
      
      recognition.onstart = () => {
        log('Speech recognition started successfully');
        setIsListening(true);
      };
      
      recognition.onend = () => {
        log('Speech recognition ended');
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        log(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        log(`Heard: "${transcript}"`);
      };
      
      log('Starting speech recognition...');
      recognition.start();
      
    } catch (error) {
      log(`Error: ${error}`);
    }
  };

  const stopListening = () => {
    log('Stop clicked');
    setIsListening(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Simple Voice Test</h1>
        
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Voice Control Debug</h2>
          
          <div className="flex gap-2 mb-4">
            <span className={`px-3 py-1 rounded text-sm ${isSupported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isSupported ? 'Supported' : 'Not Supported'}
            </span>
            <span className={`px-3 py-1 rounded text-sm ${isListening ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              {isListening ? 'Listening' : 'Not Listening'}
            </span>
          </div>
          
          <div className="flex gap-3 mb-6">
            <Button
              onClick={isListening ? stopListening : testVoiceControl}
              variant={isListening ? "destructive" : "default"}
            >
              {isListening ? 'Stop Listening' : 'Start Listening'}
            </Button>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Debug Log:</h3>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

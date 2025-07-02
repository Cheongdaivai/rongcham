'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function TestVoicePage() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [permissionStatus, setPermissionStatus] = useState('checking');
  
  const recognitionRef = useRef<any>(null);

  const addDebugInfo = (info: string) => {
    console.log(info);
    setDebugInfo(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    addDebugInfo('🚀 Starting voice control test...');
    
    // Detailed browser detection
    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isEdge = /Edg/.test(userAgent);
    
    addDebugInfo(`🌐 Browser: ${isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : isEdge ? 'Edge' : 'Unknown'}`);
    addDebugInfo(`🌐 User agent: ${userAgent.substring(0, 80)}...`);
    
    // Check browser support with detailed logging
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    addDebugInfo(`🔍 window.SpeechRecognition: ${!!(window as any).SpeechRecognition}`);
    addDebugInfo(`🔍 window.webkitSpeechRecognition: ${!!(window as any).webkitSpeechRecognition}`);
    addDebugInfo(`🔍 Combined SpeechRecognition: ${!!SpeechRecognition}`);
    
    // Check HTTPS
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    addDebugInfo(`🔒 Secure context: ${isSecure}`);
    
    // Browser-specific compatibility info
    if (isFirefox) {
      addDebugInfo('⚠️ Firefox has limited Web Speech API support');
      addDebugInfo('⚠️ Firefox may require enabling media.webspeech.recognition.enable in about:config');
      addDebugInfo('⚠️ Consider using Chrome or Edge for better voice support');
    } else if (isChrome) {
      addDebugInfo('✅ Chrome has excellent Web Speech API support');
    } else if (isSafari) {
      addDebugInfo('⚠️ Safari has partial Web Speech API support');
    } else if (isEdge) {
      addDebugInfo('✅ Edge has good Web Speech API support');
    }
    
    if (SpeechRecognition && isSecure) {
      setIsSupported(true);
      addDebugInfo('✅ Voice control supported');
      // Don't request permission immediately, wait for user action
      setPermissionStatus('prompt');
    } else {
      setIsSupported(false);
      addDebugInfo('❌ Voice control not supported');
      
      if (!isSecure) {
        addDebugInfo('❌ HTTPS required for voice recognition');
      }
      
      if (!SpeechRecognition) {
        if (isFirefox) {
          addDebugInfo('❌ Firefox: Web Speech API not available');
          addDebugInfo('💡 Try enabling media.webspeech.recognition.enable in about:config');
          addDebugInfo('💡 Or use Chrome/Edge for better compatibility');
        } else {
          addDebugInfo('❌ Web Speech API not supported in this browser');
          addDebugInfo('💡 Try Chrome, Edge, or Safari');
        }
      }
    }
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      addDebugInfo('🎤 Requesting microphone permission...');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Permission granted, stop the stream as we only needed it for permission
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionStatus('granted');
      addDebugInfo('✅ Microphone permission granted');
      return true;
    } catch (error) {
      addDebugInfo(`❌ Microphone permission denied: ${error}`);
      setPermissionStatus('denied');
      setError('Microphone permission denied. Please allow microphone access to use voice control.');
      return false;
    }
  };

  const startListening = async () => {
    addDebugInfo('🎧 Start listening clicked');
    setError('');
    
    if (!isSupported) {
      const errorMsg = 'Speech recognition not supported in this browser';
      setError(errorMsg);
      addDebugInfo(`❌ ${errorMsg}`);
      return;
    }

    // Request microphone permission first
    if (permissionStatus !== 'granted') {
      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) {
        addDebugInfo('❌ Cannot start without microphone permission');
        return;
      }
    }

    try {
      // Stop any existing recognition
      if (recognitionRef.current) {
        addDebugInfo('🛑 Stopping existing recognition');
        recognitionRef.current.stop();
      }

      // Create new recognition instance
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      addDebugInfo('🔧 Configuring recognition...');
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        addDebugInfo('✅ Recognition started');
        setIsListening(true);
        setError('');
      };

      recognition.onend = () => {
        addDebugInfo('🔚 Recognition ended');
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        const errorMsg = `Recognition error: ${event.error}`;
        addDebugInfo(`❌ ${errorMsg}`);
        setError(errorMsg);
        setIsListening(false);

        // Specific error handling
        if (event.error === 'not-allowed') {
          addDebugInfo('❌ Microphone permission denied');
          setPermissionStatus('denied');
        } else if (event.error === 'no-speech') {
          addDebugInfo('⚠️ No speech detected');
        } else if (event.error === 'audio-capture') {
          addDebugInfo('❌ Audio capture failed');
        } else if (event.error === 'network') {
          addDebugInfo('❌ Network error');
        }
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        
        setTranscript(currentTranscript);
        addDebugInfo(`🎯 Heard: "${currentTranscript.substring(0, 30)}..."`);
      };

      recognitionRef.current = recognition;
      
      addDebugInfo('🚀 Starting recognition...');
      recognition.start();
      
    } catch (error) {
      const errorMsg = `Failed to start: ${error}`;
      addDebugInfo(`❌ ${errorMsg}`);
      setError(errorMsg);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      addDebugInfo('🛑 Stopping recognition');
      recognitionRef.current.stop();
    }
  };

  const clearAll = () => {
    setTranscript('');
    setError('');
    setDebugInfo([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Voice Control Test Page</h1>
        
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Voice Recognition Test</h2>
          
          {/* Status Indicators */}
          <div className="flex gap-2 mb-4">
            <span className={`px-3 py-1 rounded text-sm ${isSupported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isSupported ? 'Supported' : 'Not Supported'}
            </span>
            <span className={`px-3 py-1 rounded text-sm ${permissionStatus === 'granted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              Mic: {permissionStatus}
            </span>
            <span className={`px-3 py-1 rounded text-sm ${isListening ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              {isListening ? 'Listening' : 'Not Listening'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex gap-3 mb-6">
            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={!isSupported}
              variant={isListening ? "destructive" : "default"}
            >
              {isListening ? 'Stop Listening' : 'Start Listening'}
            </Button>
            <Button onClick={clearAll} variant="outline">
              Clear All
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Transcript */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Live Transcript:</h3>
            <div className="bg-white border rounded p-4 min-h-[100px]">
              {transcript || (isListening ? "Listening... Say something!" : "Click 'Start Listening' to begin")}
            </div>
          </div>

          {/* Debug Info */}
          <div>
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <div className="bg-gray-100 border rounded p-4 h-64 overflow-y-auto font-mono text-sm">
              {debugInfo.map((info, index) => (
                <div key={index} className="mb-1">
                  {info}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Browser Compatibility & Instructions</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">✅ Fully Supported Browsers:</h4>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li><strong>Google Chrome</strong> - Best support, recommended</li>
                <li><strong>Microsoft Edge</strong> - Excellent support</li>
                <li><strong>Safari</strong> - Good support on macOS/iOS</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-yellow-700 mb-2">⚠️ Limited Support:</h4>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li><strong>Firefox</strong> - Limited Web Speech API support</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <h4 className="font-medium text-yellow-800 mb-2">Firefox Users:</h4>
              <p className="text-sm text-yellow-700 mb-2">
                Firefox has limited Web Speech API support. To enable it:
              </p>
              <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1 ml-4">
                <li>Type <code className="bg-yellow-100 px-1 rounded">about:config</code> in the address bar</li>
                <li>Accept the warning if prompted</li>
                <li>Search for <code className="bg-yellow-100 px-1 rounded">media.webspeech.recognition.enable</code></li>
                <li>Set it to <code className="bg-yellow-100 px-1 rounded">true</code></li>
                <li>Restart Firefox</li>
              </ol>
              <p className="text-sm text-yellow-700 mt-2 font-medium">
                Note: Even with this setting, Firefox support may be unstable. Chrome is recommended.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">How to Test:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Use a supported browser (Chrome/Edge recommended)</li>
                <li>Make sure you're on HTTPS or localhost</li>
                <li>Allow microphone permissions when prompted</li>
                <li>Click "Start Listening"</li>
                <li>Speak clearly into your microphone</li>
                <li>Watch the transcript and debug information</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

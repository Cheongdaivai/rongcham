import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    let isGeminiWorking = false
    
    if (apiKey) {
      try {
        // Test the API with a simple request
        const testResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: "Say 'OK' if you're working"
                    }
                  ]
                }
              ]
            })
          }
        )
        
        if (testResponse.ok) {
          isGeminiWorking = true
        }
      } catch (error) {
        console.error('Gemini API test failed:', error)
      }
    }
    
    return NextResponse.json({
      available: isGeminiWorking,
      geminiConfigured: !!apiKey,
      model: 'gemini-1.5-flash',
      features: {
        voiceControl: true,
        aiProcessing: isGeminiWorking,
        analytics: true,
        realTimeCommands: isGeminiWorking
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check AI status' },
      { status: 500 }
    )
  }
}
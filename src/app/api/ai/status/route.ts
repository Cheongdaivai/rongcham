import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({
        available: false,
        geminiConfigured: false,
        model: 'gemini-1.5-flash',
        features: {
          voiceControl: false,
          aiProcessing: false,
          analytics: true,
          realTimeCommands: false
        }
      })
    }

    // Quick API test with minimal quota usage
    let isGeminiWorking = false
    try {
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
                    text: "OK" // Minimal test - just 2 characters
                  }
                ]
              }
            ]
          })
        }
      )
      
      isGeminiWorking = testResponse.ok
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text()
        console.log(`Gemini API status check failed: ${testResponse.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('Gemini API status check error:', error)
      isGeminiWorking = false
    }
    
    return NextResponse.json({
      available: isGeminiWorking, // Show actual API availability status
      geminiConfigured: true,
      geminiWorking: isGeminiWorking,
      model: isGeminiWorking ? 'gemini-1.5-flash' : 'gemini-1.5-flash (rate limited)',
      status: isGeminiWorking ? 'available' : 'rate limited - using fallback',
      features: {
        voiceControl: true, // Always available with fallback
        aiProcessing: isGeminiWorking, // Only true if API actually works
        analytics: true,
        realTimeCommands: true // Always available with fallback
      }
    })
  } catch (err) {
    console.error('AI status check error:', err)
    return NextResponse.json(
      { error: 'Failed to check AI status' },
      { status: 500 }
    )
  }
}
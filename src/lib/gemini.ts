import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set GEMINI_API_KEY environment variable.')
  }
  
  return new GoogleGenerativeAI(apiKey)
}

export interface AICommandAnalysis {
  intent: 'order_status' | 'order_query' | 'menu_query' | 'help' | 'unknown'
  entities: {
    orderNumber?: number
    status?: 'pending' | 'done' | 'cancelled'
    quantity?: number
    menuItem?: string
    timeframe?: string
  }
  confidence: number
  suggestedAction: string
  parameters: Record<string, unknown>
}

export class GeminiAIService {
  private genAI: GoogleGenerativeAI
  private model: unknown

  constructor() {
    this.genAI = getGeminiClient()
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }

  async analyzeVoiceCommand(
    command: string, 
    context: {
      availableOrders: Array<{order_number: number, status: string, total_amount: number}>
      availableMenuItems: Array<{name: string, menu_id: string, availability: boolean, total_ordered: number}>
    }
  ): Promise<AICommandAnalysis> {
    
    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      console.log('Gemini API key not found, using fallback analysis')
      return this.fallbackAnalysis(command)
    }
    
    const systemPrompt = `
You are an AI assistant for a Thai restaurant ordering system. Analyze voice commands and extract intent and entities.

AVAILABLE ORDERS:
${context.availableOrders.map(o => `Order #${o.order_number}: ${o.status} - $${o.total_amount}`).join('\n')}

AVAILABLE MENU ITEMS:
${context.availableMenuItems.map(m => `${m.name} (${m.availability ? 'available' : 'unavailable'}) - ordered ${m.total_ordered} times`).join('\n')}

COMMAND TYPES:
1. ORDER_STATUS: Update order status (e.g., "mark order 123 as done", "set order 456 to preparing", "complete order 789")
2. ORDER_QUERY: Query order information (e.g., "how many pending orders", "show preparing orders", "list recent orders")
3. MENU_QUERY: Query menu information (e.g., "show popular items", "what's available", "best selling dishes")
4. HELP: Request help or list commands

COMMON MISPRONOUNCIATIONS TO WATCH FOR:
- "to" → "two" (number context)
- "depending" → "pending" (order status context)
- "all the" → "order" (already handled)
- "other" → "order" (already handled)

RESPONSE FORMAT (JSON only):
{
  "intent": "order_status|order_query|menu_query|help|unknown",
  "entities": {
    "orderNumber": number (if mentioned),
    "status": "pending|preparing|done|cancelled" (if mentioned),
    "quantity": number (if mentioned),
    "menuItem": "string" (if mentioned),
    "timeframe": "string" (if mentioned like "today", "this hour")
  },
  "confidence": 0.0-1.0,
  "suggestedAction": "Human readable description of what should be done",
  "parameters": {
    "any additional extracted parameters"
  }
}

EXAMPLES:
Input: "mark order 123 as done"
Output: {"intent": "order_status", "entities": {"orderNumber": 123, "status": "done"}, "confidence": 0.95, "suggestedAction": "Update order 123 status to done", "parameters": {}}

Input: "how many orders are pending"
Output: {"intent": "order_query", "entities": {}, "confidence": 0.9, "suggestedAction": "Count and display pending orders", "parameters": {"filter": "pending"}}

Input: "what are the most popular dishes"
Output: {"intent": "menu_query", "entities": {}, "confidence": 0.9, "suggestedAction": "Show menu items sorted by total_ordered descending", "parameters": {"sortBy": "popularity"}}

Now analyze this command: "${command}"
`

    try {
      const result = await (this.model as any).generateContent(systemPrompt)
      const response = await result.response
      
      // Check if response indicates unavailable model
      if (response.candidates.length === 0) {
        console.log('Gemini model returned no candidates, using fallback analysis')
        return this.fallbackAnalysis(command)
      }
      
      const text = response.text()
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response')
      }
      
      const analysis: AICommandAnalysis = JSON.parse(jsonMatch[0])
      
      // Validate and sanitize the response
      if (!analysis.intent) {
        analysis.intent = 'unknown'
        analysis.confidence = 0.1
      }
      
      if (!analysis.entities) {
        analysis.entities = {}
      }
      
      if (typeof analysis.confidence !== 'number') {
        analysis.confidence = 0.5
      }
      
      if (!analysis.suggestedAction) {
        analysis.suggestedAction = 'Unable to determine action'
      }
      
      if (!analysis.parameters) {
        analysis.parameters = {}
      }
      
      return analysis
      
    } catch (error) {
      console.error('Error analyzing command with Gemini:', error)
      
      // Check if it's a quota/availability error and log it
      if (error instanceof Error && error.message.includes('quota')) {
        console.log('Gemini API quota exceeded, using fallback analysis')
      } else if (error instanceof Error && error.message.includes('unavailable')) {
        console.log('Gemini model unavailable, using fallback analysis')
      }
      
      // Fallback analysis using simple keyword matching
      return this.fallbackAnalysis(command)
    }
  }

  private fallbackAnalysis(command: string): AICommandAnalysis {
    let lowerCommand = command.toLowerCase()
    
    // Handle common mispronounciations before analysis
    lowerCommand = lowerCommand.replace(/\b(to)\b/gi, 'two')
    lowerCommand = lowerCommand.replace(/\b(depending)\b/gi, 'pending')
    lowerCommand = lowerCommand.replace(/\b(all the|other|item|request|job|audio|older)\b/gi, 'order')
    
    // Simple keyword-based fallback
    if (lowerCommand.includes('mark') || lowerCommand.includes('set') || lowerCommand.includes('update')) {
      const orderMatch = lowerCommand.match(/order\s+(\d+)/)
      const orderNumber = orderMatch ? parseInt(orderMatch[1]) : undefined
      
      let status: 'pending' | 'done' | 'cancelled' | undefined = undefined
      if (lowerCommand.includes('done') || lowerCommand.includes('complete')) status = 'done'
      else if (lowerCommand.includes('preparing')) status = 'done'  // Map preparing to done
      else if (lowerCommand.includes('cancel')) status = 'cancelled'
      else if (lowerCommand.includes('pending')) status = 'pending'
      
      return {
        intent: 'order_status',
        entities: { orderNumber, status },
        confidence: 0.7,
        suggestedAction: `Update order ${orderNumber || '?'} to ${status || 'unknown status'}`,
        parameters: {}
      }
    }
    
    if (lowerCommand.includes('how many') || lowerCommand.includes('pending') || lowerCommand.includes('preparing')) {
      return {
        intent: 'order_query',
        entities: {},
        confidence: 0.6,
        suggestedAction: 'Query order information',
        parameters: {}
      }
    }
    
    if (lowerCommand.includes('popular') || lowerCommand.includes('menu') || lowerCommand.includes('best')) {
      return {
        intent: 'menu_query',
        entities: {},
        confidence: 0.6,
        suggestedAction: 'Query menu information',
        parameters: {}
      }
    }
    
    if (lowerCommand.includes('help')) {
      return {
        intent: 'help',
        entities: {},
        confidence: 0.8,
        suggestedAction: 'Show help information',
        parameters: {}
      }
    }
    
    return {
      intent: 'unknown',
      entities: {},
      confidence: 0.1,
      suggestedAction: 'Command not understood',
      parameters: {}
    }
  }

  async generateSmartResponse(
    analysis: AICommandAnalysis,
    executionResult: unknown
  ): Promise<string> {
    
    const contextPrompt = `
You are a helpful AI assistant for a Thai restaurant. 

The user gave this voice command analysis:
Intent: ${analysis.intent}
Entities: ${JSON.stringify(analysis.entities)}
Suggested Action: ${analysis.suggestedAction}

The system executed the action with this result:
${JSON.stringify(executionResult)}

Generate a natural, conversational response (2-3 sentences max) that:
1. Confirms what was done
2. Provides relevant information from the result
3. Uses a friendly, professional tone
4. Is suitable for voice synthesis

Examples:
- "Order 123 has been marked as done. The customer will be notified."
- "You have 3 pending orders and 2 orders being prepared right now."
- "Your most popular item is Pad Thai with 47 orders, followed by Green Curry with 23 orders."
`

    try {
      const result = await (this.model as any).generateContent(contextPrompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error('Error generating smart response:', error)
      
      // Fallback response
      if (analysis.intent === 'order_status' && (executionResult as any).success) {
        return `Order ${analysis.entities.orderNumber} has been updated to ${analysis.entities.status}.`
      } else if (analysis.intent === 'order_query') {
        return 'Order information has been retrieved.'
      } else if (analysis.intent === 'menu_query') {
        return 'Menu information is ready.'
      } else {
        return 'Command processed successfully.'
      }
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiAIService()
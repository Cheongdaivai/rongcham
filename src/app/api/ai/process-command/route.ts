import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth-server'
import { getAllOrdersServer, getAllMenuItemsServer, updateOrderStatusServer } from '@/lib/database-server'

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

interface AICommandAnalysis {
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
  parameters: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { command } = await request.json()
    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 })
    }

    // Get current system state
    const [orders, menuItems] = await Promise.all([
      getAllOrdersServer(),
      getAllMenuItemsServer()
    ])

    // Analyze command with Gemini
    const analysis = await analyzeCommandWithGemini(command, { orders, menuItems })
    
    // Execute the command based on analysis
    const executionResult = await executeCommand(analysis)
    
    // Generate smart response
    const response = await generateSmartResponse(analysis, executionResult)

    return NextResponse.json({
      success: true,
      analysis,
      executionResult,
      response,
      transcript: command
    })

  } catch (error) {
    console.error('Error processing AI command:', error)
    return NextResponse.json(
      { error: 'Failed to process command' }, 
      { status: 500 }
    )
  }
}

async function analyzeCommandWithGemini(
  command: string, 
  context: { orders: any[], menuItems: any[] }
): Promise<AICommandAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    return fallbackAnalysis(command)
  }

  const systemPrompt = `
You are an AI assistant for a Thai restaurant ordering system. Analyze voice commands and extract intent and entities.

AVAILABLE ORDERS:
${context.orders.slice(0, 10).map(o => `Order #${o.order_number}: ${o.status} - $${o.total_amount}`).join('\n')}

AVAILABLE MENU ITEMS:
${context.menuItems.slice(0, 20).map(m => `${m.name} (${m.availability ? 'available' : 'unavailable'}) - ordered ${m.total_ordered || 0} times`).join('\n')}

COMMAND TYPES:
1. ORDER_STATUS: Update order status (e.g., "mark order 123 as done", "cancel order 456", "complete order 789", "finish order 123", "mark as complete the order")
2. ORDER_QUERY: Query order information (e.g., "how many pending orders", "show done orders", "list recent orders")
3. MENU_QUERY: Query menu information (e.g., "show popular items", "what's available", "best selling dishes")
4. HELP: Request help or list commands

COMMON MISPRONOUNCIATIONS TO WATCH FOR:
- "to" → "two" (number context)
- "depending" → "pending" (order status context)
- "all the" → "order" (already handled)
- "other" → "order" (already handled)

IMPORTANT: For commands like "mark as complete the order" or "complete order", set status to "done".

RESPONSE FORMAT (JSON only, no extra text):
{
  "intent": "order_status|order_query|menu_query|help|unknown",
  "entities": {
    "orderNumber": number (if mentioned),
    "status": "pending|done|cancelled" (if mentioned),
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

Now analyze this command: "${command}"
`

  try {
    const response = await fetch(
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
                  text: systemPrompt
                }
              ]
            }
          ]
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`Gemini API error ${response.status}: ${errorText}`)
      // For quota errors (429) or unavailable models, immediately use fallback
      if (response.status === 429 || response.status === 503 || errorText.includes('quota')) {
        console.log('Gemini API unavailable, using fallback analysis')
        return fallbackAnalysis(command)
      }
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data: GeminiResponse = await response.json()
    const text = data.candidates[0]?.content?.parts[0]?.text || ''
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response')
    }
    
    const analysis: AICommandAnalysis = JSON.parse(jsonMatch[0])
    
    // Validate and sanitize
    return {
      intent: analysis.intent || 'unknown',
      entities: analysis.entities || {},
      confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 0.5,
      suggestedAction: analysis.suggestedAction || 'Unable to determine action',
      parameters: analysis.parameters || {}
    }

  } catch (error) {
    console.error('Error with Gemini API:', error)
    return fallbackAnalysis(command)
  }
}

function fallbackAnalysis(command: string): AICommandAnalysis {
  let lowerCommand = command.toLowerCase()
  
  // Handle common mispronounciations before analysis
  lowerCommand = lowerCommand.replace(/\b(to)\b/gi, 'two')
  lowerCommand = lowerCommand.replace(/\b(depending)\b/gi, 'pending')
  lowerCommand = lowerCommand.replace(/\b(all the|other|item|request|job|audio|older)\b/gi, 'order')
  
  // Enhanced keyword-based fallback for order status updates
  if (lowerCommand.includes('mark') || lowerCommand.includes('set') || lowerCommand.includes('update') || 
      lowerCommand.includes('complete') || lowerCommand.includes('finish')) {
    
    // Try multiple patterns to extract order number
    let orderMatch = lowerCommand.match(/order\s+(\d+)/)
    if (!orderMatch) {
      orderMatch = lowerCommand.match(/(\d+)/)  // Any number in the command
    }
    const orderNumber = orderMatch ? parseInt(orderMatch[1]) : undefined
    
    let status: 'pending' | 'done' | 'cancelled' | undefined = undefined
    if (lowerCommand.includes('done') || lowerCommand.includes('complete') || 
        lowerCommand.includes('finish') || lowerCommand.includes('ready')) {
      status = 'done'
    }
    else if (lowerCommand.includes('preparing') || lowerCommand.includes('cooking')) {
      status = 'done'  // Map preparing to done for simplicity
    }
    else if (lowerCommand.includes('cancel')) {
      status = 'cancelled'
    }
    else if (lowerCommand.includes('pending') || lowerCommand.includes('waiting')) {
      status = 'pending'
    }
    
    return {
      intent: 'order_status',
      entities: { orderNumber, status },
      confidence: 0.8,
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
  
  return {
    intent: 'unknown',
    entities: {},
    confidence: 0.1,
    suggestedAction: 'Command not understood',
    parameters: {}
  }
}

async function executeCommand(analysis: AICommandAnalysis): Promise<any> {
  try {
    switch (analysis.intent) {
      case 'order_status':
        if (analysis.entities.orderNumber && analysis.entities.status) {
          // Find the order by order_number to get the order_id
          const orders = await getAllOrdersServer()
          const targetOrder = orders.find(o => o.order_number === analysis.entities.orderNumber)
          
          if (!targetOrder) {
            return { 
              success: false, 
              error: `Order number ${analysis.entities.orderNumber} not found`,
              orderNumber: analysis.entities.orderNumber
            }
          }
          
          const result = await updateOrderStatusServer(
            targetOrder.order_id,  // Use order_id, not order_number
            analysis.entities.status
          )
          return {
            success: !!result,
            action: 'order_status_update',
            orderNumber: analysis.entities.orderNumber,
            orderId: targetOrder.order_id,
            newStatus: analysis.entities.status,
            result
          }
        }
        return { success: false, error: 'Missing order number or status' }

      case 'order_query':
        const orders = await getAllOrdersServer()
        const pendingCount = orders.filter(o => o.status === 'pending').length
        const doneCount = orders.filter(o => o.status === 'done').length
        const cancelledCount = orders.filter(o => o.status === 'cancelled').length
        
        return {
          success: true,
          action: 'order_query',
          data: {
            total: orders.length,
            pending: pendingCount,
            done: doneCount,
            cancelled: cancelledCount,
            recent: orders.slice(0, 5)
          }
        }

      case 'menu_query':
        const menuItems = await getAllMenuItemsServer()
        const popularItems = menuItems
          .sort((a, b) => (b.total_ordered || 0) - (a.total_ordered || 0))
          .slice(0, 5)
        
        return {
          success: true,
          action: 'menu_query',
          data: {
            total: menuItems.length,
            available: menuItems.filter(m => m.availability).length,
            popularItems: popularItems.map(item => ({
              name: item.name,
              orders: item.total_ordered || 0,
              price: item.price
            }))
          }
        }

      case 'help':
        return {
          success: true,
          action: 'help',
          data: {
            commands: [
              'Mark order [number] as done',
              'How many pending orders?',
              'Show popular items',
              'What orders are done?'
            ]
          }
        }

      default:
        return {
          success: false,
          action: 'unknown',
          error: 'Command not understood'
        }
    }
  } catch (error) {
    console.error('Error executing command:', error)
    return {
      success: false,
      error: 'Failed to execute command'
    }
  }
}

async function generateSmartResponse(
  analysis: AICommandAnalysis,
  executionResult: any
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    return generateFallbackResponse(analysis, executionResult)
  }

  const contextPrompt = `
You are a helpful AI assistant for a Thai restaurant. Generate a natural, conversational response (2-3 sentences max) that:
1. Confirms what was done
2. Provides relevant information from the result
3. Uses a friendly, professional tone
4. Is suitable for voice synthesis

User Intent: ${analysis.intent}
Suggested Action: ${analysis.suggestedAction}
Execution Result: ${JSON.stringify(executionResult)}

Generate a response:
`

  try {
    const response = await fetch(
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
                  text: contextPrompt
                }
              ]
            }
          ]
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`Gemini API error ${response.status}: ${errorText}`)
      // For quota errors (429) or unavailable models, immediately use fallback
      if (response.status === 429 || response.status === 503 || errorText.includes('quota')) {
        console.log('Gemini API unavailable, using fallback response')
        return generateFallbackResponse(analysis, executionResult)
      }
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data: GeminiResponse = await response.json()
    return data.candidates[0]?.content?.parts[0]?.text?.trim() || generateFallbackResponse(analysis, executionResult)

  } catch (error) {
    console.error('Error generating smart response:', error)
    return generateFallbackResponse(analysis, executionResult)
  }
}

function generateFallbackResponse(analysis: AICommandAnalysis, executionResult: any): string {
  if (analysis.intent === 'order_status' && executionResult.success) {
    return `Order ${analysis.entities.orderNumber} has been updated to ${analysis.entities.status}.`
  } else if (analysis.intent === 'order_status' && !executionResult.success) {
    return executionResult.error || `I'm sorry, I couldn't update order ${analysis.entities.orderNumber}. Please try again.`
  } else if (analysis.intent === 'order_query' && executionResult.success) {
    const data = executionResult.data
    return `You have ${data.pending} pending orders, ${data.done} completed orders, and ${data.cancelled} cancelled orders.`
  } else if (analysis.intent === 'menu_query' && executionResult.success) {
    const popular = executionResult.data.popularItems[0]
    return `Your most popular item is ${popular?.name} with ${popular?.orders} orders.`
  } else if (analysis.intent === 'help') {
    return 'You can say things like "mark order 123 as done", "how many pending orders", or "show popular items".'
  } else {
    return 'Command processed successfully.'
  }
}
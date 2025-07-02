import { Order, MenuItem } from '@/types'
import { updateOrderStatus, getAllOrders, getAllMenuItems } from './database'
import { geminiService, AICommandAnalysis } from './gemini'

export interface AIVoiceCommandResult {
  success: boolean
  message: string
  smartResponse: string
  data?: any
  analysis?: AICommandAnalysis
  confidence: number
}

export class AIVoiceCommandProcessor {
  private orders: Order[] = []
  private menuItems: MenuItem[] = []
  
  constructor() {
    this.loadData()
  }

  private async loadData() {
    try {
      const [ordersData, menuData] = await Promise.all([
        getAllOrders(),
        getAllMenuItems()
      ])
      this.orders = ordersData
      this.menuItems = menuData
    } catch (error) {
      console.error('Error loading data for AI voice commands:', error)
    }
  }

  async processCommand(command: string): Promise<AIVoiceCommandResult> {
    try {
      // Refresh data before processing
      await this.loadData()

      // Preprocess: treat multiple variations that sound like "order" as "order"
      let normalized = command.toLowerCase()
      normalized = normalized.replace(/\b(all the|other|item|request|job|audio|older|order)\b/gi, 'order')
      
      // Also normalize status words to avoid misheard words
      normalized = normalized.replace(/\b(finish|complete|ready|finished|over|cooking|making|working|active|begin|preparing)\b/gi, 'done')
      normalized = normalized.replace(/\b(stop|remove|delete|void)\b/gi, 'cancelled')
      normalized = normalized.replace(/\b(waiting|new|queue)\b/gi, 'pending')

      // Prepare context for AI analysis
      const context = {
        availableOrders: this.orders.map(o => ({
          order_number: o.order_number,
          status: o.status,
          total_amount: o.total_amount
        })),
        availableMenuItems: this.menuItems.map(m => ({
          name: m.name,
          menu_id: m.menu_id,
          availability: m.availability,
          total_ordered: m.total_ordered || 0
        }))
      }

      // Analyze command with Gemini AI
      const analysis = await geminiService.analyzeVoiceCommand(normalized, context)

      // If the status is a variant of done, finish, complete, ready, etc., normalize to 'done'
      if (analysis.entities && analysis.entities.status) {
        const status = String(analysis.entities.status).toLowerCase()
        if (["finish", "complete", "ready", "finished", "over", "cooking", "making", "working", "active", "begin", "preparing"].includes(status)) {
          analysis.entities.status = 'done'
        } else if (["stop", "remove", "delete", "void"].includes(status)) {
          analysis.entities.status = 'cancelled'  
        } else if (["waiting", "new", "queue"].includes(status)) {
          analysis.entities.status = 'pending'
        }
      }

      // Execute the command based on AI analysis
      const executionResult = await this.executeCommand(analysis)

      // Generate smart response using AI
      const smartResponse = await geminiService.generateSmartResponse(analysis, executionResult)

      return {
        success: executionResult.success,
        message: executionResult.message,
        smartResponse,
        data: executionResult.data,
        analysis,
        confidence: analysis.confidence
      }

    } catch (error) {
      console.error('Error processing AI voice command:', error)
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        smartResponse: "I'm sorry, I encountered an error processing your request. Please try again.",
        confidence: 0
      }
    }
  }

  private async executeCommand(analysis: AICommandAnalysis): Promise<{success: boolean, message: string, data?: any}> {
    switch (analysis.intent) {
      case 'order_status':
        return await this.handleOrderStatusCommand(analysis)
      
      case 'order_query':
        return await this.handleOrderQueryCommand(analysis)
      
      case 'menu_query':
        return await this.handleMenuQueryCommand(analysis)
      
      case 'help':
        return this.handleHelpCommand()
      
      default:
        return {
          success: false,
          message: "I didn't understand that command. Could you please rephrase it or say 'help' for assistance?"
        }
    }
  }

  private async handleOrderStatusCommand(analysis: AICommandAnalysis): Promise<{success: boolean, message: string, data?: any}> {
    const { orderNumber, status } = analysis.entities

    if (!orderNumber) {
      return {
        success: false,
        message: "I need an order number. Please say something like 'mark order 123 as done'."
      }
    }

    if (!status) {
      return {
        success: false,
        message: "I need a status. Please specify: done, preparing, cancelled, or pending."
      }
    }

    // Find the order
    const order = this.orders.find(o => o.order_number === orderNumber)
    if (!order) {
      return {
        success: false,
        message: `I couldn't find order ${orderNumber}. Please check the order number.`
      }
    }

    // Validate status transition
    if (order.status === status) {
      return {
        success: false,
        message: `Order ${orderNumber} is already ${status}.`
      }
    }

    // Update order status
    try {
      const updatedOrder = await updateOrderStatus(order.order_id, status)
      if (updatedOrder) {
        return {
          success: true,
          message: `Order ${orderNumber} updated to ${status}`,
          data: {
            order: updatedOrder,
            previousStatus: order.status,
            newStatus: status
          }
        }
      } else {
        return {
          success: false,
          message: `Failed to update order ${orderNumber}. Please try again.`
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Error updating order ${orderNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  private async handleOrderQueryCommand(analysis: AICommandAnalysis): Promise<{success: boolean, message: string, data?: any}> {
    const params = analysis.parameters

    if (params?.filter === 'pending' || analysis.suggestedAction.includes('pending')) {
      const pendingOrders = this.orders.filter(o => o.status === 'pending')
      return {
        success: true,
        message: `Found ${pendingOrders.length} pending orders`,
        data: {
          count: pendingOrders.length,
          orders: pendingOrders,
          type: 'pending'
        }
      }
    }

    // Note: 'preparing' status has been removed, treat as pending
    if (params?.filter === 'preparing' || analysis.suggestedAction.includes('preparing')) {
      const pendingOrders = this.orders.filter(o => o.status === 'pending')
      return {
        success: true,
        message: `Found ${pendingOrders.length} pending orders (in progress)`,
        data: {
          count: pendingOrders.length,
          orders: pendingOrders,
          type: 'pending'
        }
      }
    }

    // Default: comprehensive order summary
    const orderStats = {
      total: this.orders.length,
      pending: this.orders.filter(o => o.status === 'pending').length,
      done: this.orders.filter(o => o.status === 'done').length,
      cancelled: this.orders.filter(o => o.status === 'cancelled').length
    }

    return {
      success: true,
      message: `Order summary: ${orderStats.total} total, ${orderStats.pending} pending, ${orderStats.done} done, ${orderStats.cancelled} cancelled`,
      data: orderStats
    }
  }

  private async handleMenuQueryCommand(analysis: AICommandAnalysis): Promise<{success: boolean, message: string, data?: any}> {
    const params = analysis.parameters

    if (params?.sortBy === 'popularity' || analysis.suggestedAction.includes('popular')) {
      const popularItems = this.menuItems
        .filter(item => item.total_ordered > 0)
        .sort((a, b) => (b.total_ordered || 0) - (a.total_ordered || 0))
        .slice(0, 5)

      if (popularItems.length === 0) {
        return {
          success: true,
          message: "No popularity data available yet",
          data: { items: [], type: 'popular' }
        }
      }

      const topItem = popularItems[0]
      return {
        success: true,
        message: `Most popular: ${topItem.name} with ${topItem.total_ordered} orders`,
        data: {
          items: popularItems,
          type: 'popular',
          topItem
        }
      }
    }

    // Default: available menu items
    const availableItems = this.menuItems.filter(item => item.availability)
    return {
      success: true,
      message: `${availableItems.length} items available on the menu`,
      data: {
        items: availableItems,
        type: 'available',
        count: availableItems.length
      }
    }
  }

  private handleHelpCommand(): {success: boolean, message: string, data?: any} {
    const helpText = `Here's what I can help you with:
• Update orders: "Mark order 123 as done" or "Cancel order 456"
• Check orders: "How many pending orders?"
• Menu insights: "Show popular items"
• Get help: "What can you do?"

Available statuses: pending (default), done, cancelled
Just speak naturally - I'll understand what you mean!`

    return {
      success: true,
      message: helpText,
      data: {
        commands: [
          'Mark order [number] as done',
          'Cancel order [number]',
          'How many pending orders?',
          'Show popular items',
          'List available menu items',
          'Help'
        ]
      }
    }
  }
}

// Export singleton instance
export const aiVoiceCommandProcessor = new AIVoiceCommandProcessor()
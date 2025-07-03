import { Order } from '@/types'
import { updateOrderStatus, getAllOrders, getAllMenuItems } from './database'

export interface VoiceCommandResult {
  success: boolean
  message: string
  data?: any
}

export class VoiceCommandProcessor {
  private orders: Order[] = []
  private menuItems: any[] = []
  
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
      console.error('Error loading data for voice commands:', error)
    }
  }

  async processCommand(command: string): Promise<VoiceCommandResult> {
    const lowerCommand = command.toLowerCase().trim()
    
    try {
      // Refresh data before processing commands
      await this.loadData()

      // Order status commands
      if (this.isOrderStatusCommand(lowerCommand)) {
        return await this.handleOrderStatusCommand(lowerCommand)
      }

      // Order query commands
      if (this.isOrderQueryCommand(lowerCommand)) {
        return await this.handleOrderQueryCommand(lowerCommand)
      }

      // Menu query commands
      if (this.isMenuQueryCommand(lowerCommand)) {
        return await this.handleMenuQueryCommand(lowerCommand)
      }

      // General help
      if (lowerCommand.includes('help') || lowerCommand.includes('what can you do')) {
        return this.getHelpMessage()
      }

      return {
        success: false,
        message: "I didn't understand that command. Try saying 'help' to see available commands."
      }

    } catch (error) {
      return {
        success: false,
        message: `Error processing command: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  private isOrderStatusCommand(command: string): boolean {
    // Accept anything that sounds like "order" (order, other, all the, item, request, job, etc.)
    const orderLike = /(order|other|all the|item|request|job|audio|older)/i
    const statusKeywords = [
      // Action words
      'mark', 'set', 'update', 'change', 'make',
      // Completion words (avoid "done" due to "don't" confusion)
      'finish', 'complete', 'ready', 'finished', 'over',
      // Preparing words (now treated as done)
      'start', 'begin', 'cooking', 'making', 'working', 'active', 'preparing',
      // Cancel words (avoid "cancel" due to "candle" confusion) 
      'stop', 'remove', 'delete', 'void', 'cancel'
    ]
    // Must mention something like order and a status keyword
    return orderLike.test(command) && statusKeywords.some(keyword => command.includes(keyword))
  }

  private isOrderQueryCommand(command: string): boolean {
    // Use clearer alternatives to avoid misheard words
    const queryKeywords = [
      'show orders', 'list orders', 'show items', 'list items',
      'pending orders', 'waiting orders', 'new orders',
      'how many orders', 'how many items', 'count orders',
      'order status', 'item status', 'kitchen status'
    ]
    return queryKeywords.some(keyword => command.includes(keyword))
  }

  private isMenuQueryCommand(command: string): boolean {
    const menuKeywords = ['show menu', 'list menu', 'popular items', 'best selling']
    return menuKeywords.some(keyword => command.includes(keyword))
  }

  private async handleOrderStatusCommand(command: string): Promise<VoiceCommandResult> {
    // Accept multiple variations that sound like "order" + number
    const orderMatch = command.match(/(?:order|other|all the|item|request|job|audio|older)\s+(?:number\s+)?(\d+)/i)
    if (!orderMatch) {
      return {
        success: false,
        message: "Please specify an order number, like 'set item 123 as ready'"
      }
    }

    const orderNumber = parseInt(orderMatch[1])
    const order = this.orders.find(o => o.order_number === orderNumber)
    
    if (!order) {
      return {
        success: false,
        message: `Order ${orderNumber} not found`
      }
    }

    // Determine new status with robust word matching
    let newStatus: Order['status'] | undefined
    
    // DONE status: includes completion and preparing words (since preparing is removed)
    if (/(finish|complete|ready|finished|over|preparing|cooking|making|working|active|start|begin)/.test(command)) {
      newStatus = 'done'
    } 
    // CANCELLED status: use alternatives to avoid "candle"/"channel" confusion
    else if (/(cancel|stop|remove|delete|void)/.test(command)) {
      newStatus = 'cancelled'
    } 
    // PENDING status: use alternatives to avoid "spending"/"ending" confusion
    else if (/(pending|waiting|new|queue)/.test(command)) {
      newStatus = 'pending'
    } 
    else {
      return {
        success: false,
        message: "Please specify the status: ready/finished/cooking (for done), stop/void (for cancelled), or waiting/new (for pending)"
      }
    }

    // Update order status
    const updatedOrder = await updateOrderStatus(order.order_id, newStatus)
    if (updatedOrder) {
      return {
        success: true,
        message: `Order ${orderNumber} marked as ${newStatus}`,
        data: updatedOrder
      }
    } else {
      return {
        success: false,
        message: `Failed to update order ${orderNumber}`
      }
    }
  }

  private async handleOrderQueryCommand(command: string): Promise<VoiceCommandResult> {
    if (command.includes('pending') || command.includes('waiting') || command.includes('new')) {
      const pendingOrders = this.orders.filter(o => o.status === 'pending')
      return {
        success: true,
        message: `You have ${pendingOrders.length} pending orders`,
        data: pendingOrders
      }
    }

    // Note: 'preparing' status removed, treating cooking/making queries as pending orders
    if (command.includes('preparing') || command.includes('cooking') || command.includes('making') || command.includes('working')) {
      const pendingOrders = this.orders.filter(o => o.status === 'pending')
      return {
        success: true,
        message: `You have ${pendingOrders.length} orders in progress (pending)`,
        data: pendingOrders
      }
    }

    if (command.includes('how many')) {
      const totalOrders = this.orders.length
      const pendingCount = this.orders.filter(o => o.status === 'pending').length
      const doneCount = this.orders.filter(o => o.status === 'done').length
      const cancelledCount = this.orders.filter(o => o.status === 'cancelled').length
      
      // Generate varied response messages for fallback voice commands
      const fallbackResponses = [
        `I see ${pendingCount} orders waiting, ${doneCount} finished, and ${cancelledCount} cancelled.`,
        `Currently: ${pendingCount} pending, ${doneCount} completed, ${cancelledCount} cancelled orders.`,
        `Order count: ${pendingCount} in progress, ${doneCount} done, ${cancelledCount} cancelled.`,
        `There are ${pendingCount} pending orders, ${doneCount} finished orders, ${cancelledCount} cancelled.`
      ]
      
      return {
        success: true,
        message: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        data: { total: totalOrders, pending: pendingCount, done: doneCount, cancelled: cancelledCount }
      }
    }

    // Default: show recent orders
    const recentOrders = this.orders.slice(0, 5)
    return {
      success: true,
      message: `Showing ${recentOrders.length} most recent orders`,
      data: recentOrders
    }
  }

  private async handleMenuQueryCommand(command: string): Promise<VoiceCommandResult> {
    if (command.includes('popular') || command.includes('best selling')) {
      const popularItems = this.menuItems
        .filter(item => item.total_ordered > 0)
        .sort((a, b) => b.total_ordered - a.total_ordered)
        .slice(0, 5)

      if (popularItems.length === 0) {
        return {
          success: true,
          message: "No sales data available yet",
          data: []
        }
      }

      const topItem = popularItems[0]
      return {
        success: true,
        message: `Most popular item is ${topItem.name} with ${topItem.total_ordered} orders`,
        data: popularItems
      }
    }

    // Default: show available menu items
    const availableItems = this.menuItems.filter(item => item.availability)
    return {
      success: true,
      message: `You have ${availableItems.length} available menu items`,
      data: availableItems
    }
  }

  private getHelpMessage(): VoiceCommandResult {
    const helpText = `
Available voice commands (using clear words to avoid misheard commands):
• "Set item [number] as ready" (marks as done)
• "Set item [number] as cooking" (marks as done)  
• "Set item [number] as void" (marks as cancelled)
• "How many waiting orders?" (shows pending count)
• "Show cooking items" (shows pending orders in progress)
• "Show popular items" (shows bestsellers)
• Say "hey restaurant" to activate voice control

Available statuses: pending (default), done, cancelled
Pro tip: Use "item" instead of "order", "ready/cooking" for done, "void" for cancelled
    `.trim()

    return {
      success: true,
      message: helpText
    }
  }
}

// Export a singleton instance
export const voiceCommandProcessor = new VoiceCommandProcessor()
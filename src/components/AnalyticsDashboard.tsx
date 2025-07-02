'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DailyRevenue {
  date: string
  revenue: number
  orderCount: number
  avgOrderValue: number
}

interface MenuItemAnalytics {
  menu_id: string
  name: string
  total_ordered: number
  revenue: number
  avgPrice: number
}

interface AnalyticsData {
  dailyRevenue: DailyRevenue[]
  topMenuItems: MenuItemAnalytics[]
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  periodStart: string
  periodEnd: string
}

interface DayDetails {
  date: string
  orders: any[]
  totalRevenue: number
  orderCount: number
  avgOrderValue: number
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayDetails, setDayDetails] = useState<DayDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [dateRange, setDateRange] = useState(30)

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?days=${dateRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        console.error('Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDayDetails = async (date: string) => {
    setDetailsLoading(true)
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date })
      })
      
      if (response.ok) {
        const data = await response.json()
        setDayDetails(data)
        setSelectedDate(date)
      } else {
        console.error('Failed to fetch day details')
      }
    } catch (error) {
      console.error('Error fetching day details:', error)
    } finally {
      setDetailsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const getMaxRevenue = () => {
    if (!analyticsData?.dailyRevenue.length) return 0
    return Math.max(...analyticsData.dailyRevenue.map(d => d.revenue))
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  if (!analyticsData) {
    return (
      <Card className="p-6">
        <p className="text-gray-500">Failed to load analytics data.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics & History</h2>
        <div className="flex space-x-2">
          {[7, 30, 90].map((days) => (
            <Button
              key={days}
              variant={dateRange === days ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(days)}
            >
              {days} days
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(analyticsData.totalRevenue)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Orders</div>
          <div className="text-2xl font-bold text-blue-600">
            {analyticsData.totalOrders}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Avg Order Value</div>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(analyticsData.avgOrderValue)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Daily Average</div>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(analyticsData.totalRevenue / dateRange)}
          </div>
        </Card>
      </div>

      {/* Daily Revenue Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Revenue</h3>
        <div className="space-y-2">
          {analyticsData.dailyRevenue.map((day) => {
            const percentage = getMaxRevenue() > 0 ? (day.revenue / getMaxRevenue()) * 100 : 0
            return (
              <div key={day.date} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{formatDate(day.date)}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">{day.orderCount} orders</span>
                    <span className="font-semibold">{formatCurrency(day.revenue)}</span>
                  </div>
                </div>
                <div className="relative">
                  <div 
                    className="h-6 bg-green-200 rounded cursor-pointer hover:bg-green-300 transition-colors"
                    onClick={() => fetchDayDetails(day.date)}
                    title={`Click to view ${formatDate(day.date)} details`}
                  >
                    <div 
                      className="h-full bg-green-500 rounded transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Click on any bar to view detailed orders for that day
        </p>
      </Card>

      {/* Top Menu Items */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Menu Items</h3>
        <div className="space-y-3">
          {analyticsData.topMenuItems.slice(0, 10).map((item, index) => (
            <div key={item.menu_id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                  {index + 1}
                </Badge>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    {item.total_ordered} orders • Avg {formatCurrency(item.avgPrice)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(item.revenue)}</div>
                <div className="text-sm text-gray-600">revenue</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Day Details Modal */}
      {selectedDate && (
        <Card className="p-6 border-2 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {formatDate(selectedDate)} Details
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedDate(null)
                setDayDetails(null)
              }}
            >
              Close
            </Button>
          </div>

          {detailsLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ) : dayDetails ? (
            <div className="space-y-4">
              {/* Day Summary */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(dayDetails.totalRevenue)}
                  </div>
                  <div className="text-sm text-gray-600">Revenue</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {dayDetails.orderCount}
                  </div>
                  <div className="text-sm text-gray-600">Orders</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">
                    {formatCurrency(dayDetails.avgOrderValue)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Order</div>
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <h4 className="font-medium text-gray-700">Orders ({dayDetails.orders.length})</h4>
                {dayDetails.orders.map((order) => (
                  <div key={order.order_id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <div>
                      <span className="font-medium">Order #{order.order_number}</span>
                      <span className="text-gray-600 ml-2">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(order.total_amount)}</div>
                      <div className="text-xs text-gray-600">
                        {order.order_items?.length || 0} items
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No data available for this date.</p>
          )}
        </Card>
      )}
    </div>
  )
}
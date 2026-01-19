import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, Activity, Search, X, Check } from 'lucide-react'
import { botsApi } from '@/services/botsApi'
import { botStateApi, BotState } from '@/services/botStateApi'
import { tradeHistoryApi } from '@/services/tradeHistoryApi'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

type ProfitPeriod = 7 | 30 | 90 | 'all'

export function AnalyticsPage() {
  const [botStates, setBotStates] = useState<BotState[]>([])
  const [profitPeriod, setProfitPeriod] = useState<ProfitPeriod>('all')

  // Bot filter state
  const [botSearchText, setBotSearchText] = useState('')
  const [selectedBotIds, setSelectedBotIds] = useState<Set<number>>(new Set())
  const [isBotFilterActive, setIsBotFilterActive] = useState(false)
  const [isBotDropdownOpen, setIsBotDropdownOpen] = useState(false)
  const botDropdownRef = useRef<HTMLDivElement>(null)

  // Fetch bots
  const { data: bots, isLoading: botsLoading } = useQuery({
    queryKey: ['bots'],
    queryFn: botsApi.getAll,
  })

  // Fetch trade history
  const { data: trades, isLoading: tradesLoading } = useQuery({
    queryKey: ['tradeHistory'],
    queryFn: tradeHistoryApi.getAll,
  })

  // Fetch bot states for active bots count
  useEffect(() => {
    const fetchBotStates = async () => {
      try {
        const states = await botStateApi.getAllBotStates()
        setBotStates(states)
      } catch (error) {
        console.error('Failed to fetch bot states:', error)
      }
    }

    fetchBotStates()
    const interval = setInterval(fetchBotStates, 10000)
    return () => clearInterval(interval)
  }, [])

  // Close bot dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (botDropdownRef.current && !botDropdownRef.current.contains(event.target as Node)) {
        setIsBotDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Bot search results for dropdown (only existing bots)
  const botSearchResults = useMemo(() => {
    if (!bots) return []
    if (!botSearchText.trim()) return bots
    const search = botSearchText.toLowerCase()
    return bots.filter(bot => bot.name.toLowerCase().includes(search))
  }, [bots, botSearchText])

  // Filter trades by selected period and bots
  const filteredTrades = useMemo(() => {
    if (!trades) return []

    let result = trades

    // Filter by selected bots
    if (isBotFilterActive && selectedBotIds.size > 0) {
      result = result.filter(t => selectedBotIds.has(t.botId))
    }

    // Filter by period
    if (profitPeriod !== 'all') {
      const now = new Date()
      const cutoffDate = new Date(now.getTime() - profitPeriod * 24 * 60 * 60 * 1000)
      result = result.filter(t => new Date(t.closedAt) >= cutoffDate)
    }

    return result
  }, [trades, profitPeriod, isBotFilterActive, selectedBotIds])

  // Bot filter handlers
  const handleToggleBot = (botId: number) => {
    setSelectedBotIds(prev => {
      const next = new Set(prev)
      if (next.has(botId)) {
        next.delete(botId)
      } else {
        next.add(botId)
      }
      return next
    })
  }

  const handleApplyBotFilter = () => {
    setIsBotFilterActive(true)
    setIsBotDropdownOpen(false)
  }

  const handleResetBotFilter = () => {
    setSelectedBotIds(new Set())
    setBotSearchText('')
    setIsBotFilterActive(false)
    setIsBotDropdownOpen(false)
  }

  // Calculate analytics from filtered trades
  const analytics = useMemo(() => {
    const totalTrades = filteredTrades.length
    const winningTrades = filteredTrades.filter(t => t.status === 'Success').length
    const totalProfit = filteredTrades.reduce((sum, t) => sum + t.realizedPnL, 0)
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    const activeBots = botStates.filter(s => s.status?.isRunning).length

    return { totalTrades, winningTrades, totalProfit, winRate, activeBots }
  }, [filteredTrades, botStates])

  // Top performing bots (by total profit from trades)
  const topBots = useMemo(() => {
    if (!trades || !bots) return []

    const botProfits = new Map<number, { name: string; profit: number; trades: number }>()

    trades.forEach(trade => {
      const existing = botProfits.get(trade.botId) || { name: '', profit: 0, trades: 0 }
      existing.profit += trade.realizedPnL
      existing.trades += 1
      botProfits.set(trade.botId, existing)
    })

    bots.forEach(bot => {
      const existing = botProfits.get(bot.id)
      if (existing) {
        existing.name = bot.name
      }
    })

    return Array.from(botProfits.entries())
      .map(([id, data]) => ({ id, ...data }))
      .filter(b => b.name)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5)
  }, [trades, bots])

  // Recent trades (last 10)
  const recentTrades = useMemo(() => {
    if (!trades || !bots) return []

    const botNames = new Map(bots.map(b => [b.id, b.name]))

    return trades
      .slice(0, 10)
      .map(trade => ({
        ...trade,
        botName: botNames.get(trade.botId) || `Bot ${trade.botId}`
      }))
  }, [trades, bots])

  // Cumulative PnL chart data (uses filtered trades)
  const chartData = useMemo(() => {
    if (filteredTrades.length === 0) return []

    // Sort trades by closedAt date
    const sortedTrades = [...filteredTrades].sort(
      (a, b) => new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime()
    )

    // Calculate cumulative PnL
    let cumulativePnL = 0
    return sortedTrades.map((trade) => {
      cumulativePnL += trade.realizedPnL
      return {
        date: new Date(trade.closedAt).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
        }),
        fullDate: new Date(trade.closedAt).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        pnl: Number(cumulativePnL.toFixed(2)),
        tradePnL: Number(trade.realizedPnL.toFixed(2)),
      }
    })
  }, [filteredTrades])

  const isLoading = botsLoading || tradesLoading

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Analytics</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Track your trading performance and insights</p>
        </div>

        {/* Bot Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search input with dropdown */}
                <div className="relative flex-1" ref={botDropdownRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Filter by bot name..."
                      value={botSearchText}
                      onChange={(e) => {
                        setBotSearchText(e.target.value)
                        setIsBotDropdownOpen(true)
                      }}
                      onFocus={() => setIsBotDropdownOpen(true)}
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Dropdown with checkboxes */}
                  {isBotDropdownOpen && botSearchResults.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-y-auto">
                      {botSearchResults.map((bot) => (
                        <label
                          key={bot.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-muted cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedBotIds.has(bot.id)}
                            onChange={() => handleToggleBot(bot.id)}
                            className="h-4 w-4 rounded border-input"
                          />
                          <span className="text-sm flex-1">{bot.name}</span>
                          {selectedBotIds.has(bot.id) && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </label>
                      ))}
                      {selectedBotIds.size > 0 && (
                        <div className="px-3 py-2 border-t border-border text-xs text-muted-foreground">
                          Selected: {selectedBotIds.size}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleApplyBotFilter}
                    disabled={selectedBotIds.size === 0}
                    className="whitespace-nowrap"
                  >
                    Apply ({selectedBotIds.size})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleResetBotFilter}
                    disabled={!isBotFilterActive && selectedBotIds.size === 0}
                    className="whitespace-nowrap"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Active filter indicator */}
              {isBotFilterActive && selectedBotIds.size > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    Filtering by {selectedBotIds.size} bot{selectedBotIds.size > 1 ? 's' : ''}
                    {bots && ` • ${filteredTrades.length} trades`}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <div className="flex items-center gap-1">
                {([7, 30, 90, 'all'] as ProfitPeriod[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setProfitPeriod(period)}
                    className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                      profitPeriod === period
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {period === 'all' ? 'All' : period}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${analytics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${analytics.totalProfit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {profitPeriod === 'all' ? 'All time' : `Last ${profitPeriod} days`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTrades}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.winningTrades} winning ({profitPeriod === 'all' ? 'all time' : `${profitPeriod}d`})
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${analytics.winRate >= 50 ? 'text-green-600' : 'text-orange-600'}`}>
                {analytics.winRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {profitPeriod === 'all' ? 'All time' : `Last ${profitPeriod} days`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeBots}</div>
              <p className="text-xs text-muted-foreground mt-1">
                of {bots?.length || 0} total
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Chart</CardTitle>
              <CardDescription>
                Cumulative realized PnL ({profitPeriod === 'all' ? 'all time' : `last ${profitPeriod} days`})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPnlPositive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPnlNegative" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-popover border rounded-lg shadow-lg p-3">
                                <p className="text-sm text-muted-foreground">{data.fullDate}</p>
                                <p className={`text-sm font-semibold ${data.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  Total: ${data.pnl.toFixed(2)}
                                </p>
                                <p className={`text-xs ${data.tradePnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  Trade: {data.tradePnL >= 0 ? '+' : ''}${data.tradePnL.toFixed(2)}
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
                      <Area
                        type="monotone"
                        dataKey="pnl"
                        stroke={chartData[chartData.length - 1]?.pnl >= 0 ? '#22c55e' : '#ef4444'}
                        strokeWidth={2}
                        fill={chartData[chartData.length - 1]?.pnl >= 0 ? 'url(#colorPnlPositive)' : 'url(#colorPnlNegative)'}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No trading data yet</p>
                    <p className="text-sm mt-1">Complete some trades to see the chart</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Bots</CardTitle>
              <CardDescription>Bots with the highest returns</CardDescription>
            </CardHeader>
            <CardContent>
              {topBots.length > 0 ? (
                <div className="space-y-3">
                  {topBots.map((bot, index) => (
                    <div key={bot.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                        <span className="font-medium">{bot.name}</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${bot.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${bot.profit.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">{bot.trades} trades</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No data available yet</p>
                  <p className="text-sm mt-1">Start trading to see analytics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Trading Activity</CardTitle>
            <CardDescription>Latest trades across all bots</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTrades.length > 0 ? (
              <div className="space-y-2">
                {recentTrades.map((trade) => (
                  <div key={`${trade.botId}-${trade.id}`} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${trade.status === 'Success' ? 'bg-green-500' : trade.status === 'Loss' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                      <div>
                        <div className="font-medium">{trade.botName}</div>
                        <div className="text-sm text-muted-foreground">
                          {trade.positionSide} {trade.tradingPair}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${trade.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.realizedPnL >= 0 ? '+' : ''}${trade.realizedPnL.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(trade.closedAt).toLocaleDateString()} {new Date(trade.closedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent trading activity</p>
                <p className="text-sm mt-1">Your trades will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

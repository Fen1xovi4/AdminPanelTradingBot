import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { BarChart3, TrendingUp, Activity } from 'lucide-react'
import { botsApi } from '@/services/botsApi'
import { botStateApi, BotState } from '@/services/botStateApi'
import { tradeHistoryApi } from '@/services/tradeHistoryApi'

type ProfitPeriod = 7 | 30 | 90 | 'all'

export function AnalyticsPage() {
  const [botStates, setBotStates] = useState<BotState[]>([])
  const [profitPeriod, setProfitPeriod] = useState<ProfitPeriod>('all')

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

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalTrades = trades?.length || 0
    const winningTrades = trades?.filter(t => t.status === 'Success').length || 0
    const totalProfit = trades?.reduce((sum, t) => sum + t.realizedPnL, 0) || 0
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    const activeBots = botStates.filter(s => s.status?.isRunning).length

    return { totalTrades, winningTrades, totalProfit, winRate, activeBots }
  }, [trades, botStates])

  // Calculate filtered profit by period
  const filteredProfit = useMemo(() => {
    if (!trades) return 0
    if (profitPeriod === 'all') {
      return trades.reduce((sum, t) => sum + t.realizedPnL, 0)
    }

    const now = new Date()
    const cutoffDate = new Date(now.getTime() - profitPeriod * 24 * 60 * 60 * 1000)

    return trades
      .filter(t => new Date(t.closedAt) >= cutoffDate)
      .reduce((sum, t) => sum + t.realizedPnL, 0)
  }, [trades, profitPeriod])

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
          <h2 className="text-3xl font-bold text-foreground">Analytics</h2>
          <p className="text-muted-foreground mt-1">Track your trading performance and insights</p>
        </div>

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
              <div className={`text-2xl font-bold ${filteredProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${filteredProfit.toFixed(2)}
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
                {analytics.winningTrades} winning
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
              <p className="text-xs text-muted-foreground mt-1">Success rate</p>
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
              <CardDescription>Your trading performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chart visualization will be available soon</p>
                </div>
              </div>
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

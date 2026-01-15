import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { botsApi } from '@/services/botsApi'
import { botStateApi } from '@/services/botStateApi'
import { tradeHistoryApi } from '@/services/tradeHistoryApi'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Play, Pause, Trash2, TrendingUp, TrendingDown, Activity, Clock, BarChart3, WifiOff } from 'lucide-react'
import { isBotOnline } from '@/lib/utils'

type ProfitPeriod = 7 | 30 | 90 | 'all'

export function BotDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [profitPeriod, setProfitPeriod] = useState<ProfitPeriod>('all')

  const { data: bot, isLoading } = useQuery({
    queryKey: ['bot', id],
    queryFn: () => botsApi.getById(Number(id)),
    enabled: !!id,
  })

  const { data: botState } = useQuery({
    queryKey: ['botState', bot?.externalBotId],
    queryFn: () => botStateApi.getBotState(bot!.externalBotId!),
    enabled: !!bot?.externalBotId,
    refetchInterval: 5000,
  })

  const { data: _trades } = useQuery({
    queryKey: ['trades', id],
    queryFn: () => botsApi.getTrades(Number(id)),
    enabled: !!id,
  })

  const { data: logs } = useQuery({
    queryKey: ['logs', id],
    queryFn: () => botsApi.getLogs(Number(id)),
    enabled: !!id,
  })

  const { data: tradeHistory } = useQuery({
    queryKey: ['tradeHistory', id],
    queryFn: () => tradeHistoryApi.getByBotId(Number(id)),
    enabled: !!id,
    refetchInterval: 10000, // Refresh every 10 seconds
  })

  const updateMutation = useMutation({
    mutationFn: (status: string) =>
      botsApi.update(Number(id), { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot', id] })
      queryClient.invalidateQueries({ queryKey: ['bots'] })
      toast({
        title: 'Success',
        description: 'Bot status updated',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => botsApi.delete(Number(id)),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Bot deleted successfully',
      })
      navigate('/')
    },
  })

  // Calculate bot-specific analytics from trade history
  const botAnalytics = useMemo(() => {
    if (!tradeHistory) return { totalTrades: 0, winningTrades: 0, totalProfit: 0, winRate: 0 }

    const totalTrades = tradeHistory.length
    const winningTrades = tradeHistory.filter(t => t.status === 'Success' || t.realizedPnL > 0).length
    const totalProfit = tradeHistory.reduce((sum, t) => sum + t.realizedPnL, 0)
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

    return { totalTrades, winningTrades, totalProfit, winRate }
  }, [tradeHistory])

  // Calculate filtered profit by period
  const filteredProfit = useMemo(() => {
    if (!tradeHistory) return 0
    if (profitPeriod === 'all') {
      return tradeHistory.reduce((sum, t) => sum + t.realizedPnL, 0)
    }

    const now = new Date()
    const cutoffDate = new Date(now.getTime() - profitPeriod * 24 * 60 * 60 * 1000)

    return tradeHistory
      .filter(t => new Date(t.closedAt) >= cutoffDate)
      .reduce((sum, t) => sum + t.realizedPnL, 0)
  }, [tradeHistory, profitPeriod])

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  if (!bot) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Bot not found</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex gap-2">
            {bot.status === 'Active' ? (
              <Button
                variant="outline"
                onClick={() => updateMutation.mutate('Paused')}
                disabled={updateMutation.isPending}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={() => updateMutation.mutate('Active')}
                disabled={updateMutation.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Bot Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="text-2xl font-bold">{botAnalytics.totalTrades}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {botAnalytics.winningTrades} winning
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${botAnalytics.winRate >= 50 ? 'text-green-600' : 'text-orange-600'}`}>
                {botAnalytics.winRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Success rate</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{botState?.botName || bot.name}</CardTitle>
                <CardDescription>{bot.description}</CardDescription>
              </div>
              {!isBotOnline(botState?.lastUpdate) && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full border border-red-200">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm font-medium">Offline</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`text-lg font-semibold ${!isBotOnline(botState?.lastUpdate) ? 'text-red-600' : ''}`}>
                  {!isBotOnline(botState?.lastUpdate) ? 'Offline' : bot.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Strategy</p>
                <p className="text-lg font-semibold">{bot.strategy}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exchange</p>
                <p className="text-lg font-semibold">{bot.exchange}</p>
              </div>
              {bot.account && (
                <div>
                  <p className="text-sm text-muted-foreground">Account</p>
                  <p className="text-lg font-semibold">{bot.account}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Trading Pair</p>
                <p className="text-lg font-semibold">{bot.tradingPair}</p>
              </div>
            </div>

            {bot.externalBotId && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Position Details</h3>
                {(() => {
                  const isOnline = isBotOnline(botState?.lastUpdate)

                  // If bot is offline, show offline message
                  if (!isOnline) {
                    return (
                      <div className="flex items-center justify-center py-8 text-red-500">
                        <WifiOff className="h-5 w-5 mr-2" />
                        <span>Бот недоступен - данные не обновляются</span>
                      </div>
                    )
                  }

                  // Check if position data is fresh (updated within last 5 minutes)
                  const positionTimestamp = botState?.position?.timestamp ? new Date(botState.position.timestamp).getTime() : 0
                  const now = Date.now()
                  const fiveMinutesInMs = 5 * 60 * 1000
                  const isPositionDataFresh = (now - positionTimestamp) < fiveMinutesInMs
                  const hasActivePosition = botState?.position?.inPosition && isPositionDataFresh

                  if (!hasActivePosition || !botState.position) {
                    return (
                      <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <Clock className="h-5 w-5 mr-2" />
                        <span>Ждем открытия позиции...</span>
                      </div>
                    )
                  }

                  const position = botState.position

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                          <Activity className="h-3.5 w-3.5" />
                          Position
                        </p>
                        <p className={`text-lg font-semibold ${
                          position.positionSide === 'Long' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {position.positionSide} ${position.positionSize}
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Entry</p>
                        <p className="text-lg font-semibold">${position.entryPrice.toFixed(4)}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Current</p>
                        <p className="text-lg font-semibold">${position.currentPrice.toFixed(4)}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${
                        position.unrealizedPnL >= 0
                          ? 'bg-green-50 dark:bg-green-950'
                          : 'bg-red-50 dark:bg-red-950'
                      }`}>
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                          {position.unrealizedPnL >= 0 ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                          )}
                          Unrealized P&L
                        </p>
                        <p className={`text-lg font-bold ${
                          position.unrealizedPnL >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          ${position.unrealizedPnL.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-muted-foreground mb-1">Take Profit</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          ${position.takeProfit.toFixed(4)}
                        </p>
                      </div>
                      {position.stopLoss > 0 && (
                        <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                          <p className="text-sm text-muted-foreground mb-1">Stop Loss</p>
                          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                            ${position.stopLoss.toFixed(4)}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {bot.statistics && (
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Trades</p>
                  <p className="text-2xl font-bold">{bot.statistics.totalTrades}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold">{bot.statistics.winRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p
                    className={`text-2xl font-bold ${
                      bot.statistics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    ${bot.statistics.netProfit.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold">${bot.currentBalance.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>История завершенных позиций</CardDescription>
          </CardHeader>
          <CardContent>
            {tradeHistory && tradeHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {tradeHistory.map((trade) => {
                    const getSquareColor = (status: string, pnl: number) => {
                      // If status is Error but we have PnL data, it means position was closed
                      // (just not through our normal flow), so color based on PnL
                      if (status === 'Error' && (pnl !== 0 || trade.exitPrice > 0)) {
                        return pnl >= 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
                      }
                      // Real error (no position close, no PnL)
                      if (status === 'Error') return 'bg-red-500 hover:bg-red-600'
                      // Include breakeven (PnL = 0) as Success/green
                      if (status === 'Success' || pnl >= 0) return 'bg-green-500 hover:bg-green-600'
                      if (status === 'Loss' || pnl < 0) return 'bg-orange-500 hover:bg-orange-600'
                      return 'bg-gray-500 hover:bg-gray-600'
                    }

                    return (
                      <div
                        key={trade.id}
                        className={`w-6 h-6 rounded cursor-pointer transition-all ${getSquareColor(trade.status, trade.realizedPnL)}`}
                        title={`${trade.positionSide} ${trade.tradingPair}\nEntry: $${trade.entryPrice.toFixed(4)}\nExit: $${trade.exitPrice.toFixed(4)}\nP&L: $${trade.realizedPnL.toFixed(2)}\n${new Date(trade.closedAt).toLocaleString()}${trade.errorMessage ? `\nError: ${trade.errorMessage}` : ''}`}
                      />
                    )
                  })}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                    <span>Profit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded" />
                    <span>Loss</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded" />
                    <span>Error</span>
                  </div>
                  <div className="ml-auto">
                    Total: {tradeHistory.length} trades
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No completed trades yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {logs && logs.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="border-b pb-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          log.level === 'Error'
                            ? 'bg-red-100 text-red-800'
                            : log.level === 'Warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.level}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{log.message}</p>
                    {log.details && (
                      <p className="mt-1 text-xs text-muted-foreground">{log.details}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No logs yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

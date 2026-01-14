import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { botsApi } from '@/services/botsApi'
import { botStateApi, BotState } from '@/services/botStateApi'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Plus, TrendingUp, TrendingDown, Activity, DollarSign, Bot, WifiOff } from 'lucide-react'
import { CreateBotDialog } from '@/components/bots/CreateBotDialog'
import { isBotOnline } from '@/lib/utils'

export function DashboardPage() {
  const navigate = useNavigate()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [botStates, setBotStates] = useState<Record<string, BotState>>({})

  const { data: bots, isLoading } = useQuery({
    queryKey: ['bots'],
    queryFn: botsApi.getAll,
  })

  // Fetch bot states and refresh every 5 seconds
  useEffect(() => {
    const fetchBotStates = async () => {
      try {
        const states = await botStateApi.getAllBotStates()
        const statesMap: Record<string, BotState> = {}
        states.forEach(state => {
          statesMap[state.botId] = state
        })
        setBotStates(statesMap)
      } catch (error) {
        console.error('[DashboardPage] Failed to fetch bot states:', error)
      }
    }

    fetchBotStates()
    const interval = setInterval(fetchBotStates, 5000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Paused':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Error':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Trading Bots</h2>
            <p className="text-muted-foreground mt-1">Manage and monitor your trading bots</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Bot
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bots?.map((bot) => {
            const botState = botStates[bot.externalBotId || bot.id.toString()]

            // Check if bot is actually online based on last update time
            const isOnline = isBotOnline(botState?.lastUpdate)

            const positionTimestamp = botState?.position?.timestamp ? new Date(botState.position.timestamp).getTime() : 0
            const now = Date.now()
            const fiveMinutesInMs = 5 * 60 * 1000
            const isPositionDataFresh = isOnline && (now - positionTimestamp) < fiveMinutesInMs
            const realBalance = isPositionDataFresh && botState?.position?.accountBalance
              ? botState.position.accountBalance
              : bot.currentBalance

            // Determine actual status
            const displayStatus = !isOnline ? 'Offline' : bot.status
            const statusColor = !isOnline
              ? 'bg-red-100 text-red-700 border-red-200'
              : getStatusColor(bot.status)

            return (
            <Card
              key={bot.id}
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/bots/${bot.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{bot.name}</CardTitle>
                    <CardDescription className="mt-1">{bot.strategy}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!isOnline && <WifiOff className="h-3.5 w-3.5 text-red-500" />}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor}`}>
                      {displayStatus}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Exchange</span>
                    <span className="font-medium">{bot.exchange}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Trading Pair</span>
                    <span className="font-medium">{bot.tradingPair}</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Balance</span>
                      </div>
                      <span className="font-semibold">
                        ${realBalance.toFixed(2)}
                      </span>
                    </div>
                    {!isOnline ? (
                      <div className="text-xs text-red-500 flex items-center gap-1">
                        <WifiOff className="h-3 w-3" />
                        Данные недоступны
                      </div>
                    ) : isPositionDataFresh && botState?.position?.accountBalance ? (
                      <div className="text-xs text-green-600">
                        Live from exchange
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Initial: ${bot.initialBalance.toFixed(2)}
                      </div>
                    )}
                  </div>
                  {bot.statistics && (
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Total Trades</span>
                        </div>
                        <span className="font-medium">{bot.statistics.totalTrades}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5">
                          {bot.statistics.netProfit >= 0 ? (
                            <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                          )}
                          <span className="text-muted-foreground">Net Profit</span>
                        </div>
                        <span
                          className={`font-semibold ${
                            bot.statistics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          ${bot.statistics.netProfit.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Win Rate</span>
                        <span className="font-medium">{bot.statistics.winRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )})}
        </div>

        {bots?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trading bots yet</h3>
              <p className="text-muted-foreground mb-6">Get started by creating your first bot</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Bot
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateBotDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </Layout>
  )
}

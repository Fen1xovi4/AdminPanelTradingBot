import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { botsApi } from '@/services/botsApi'
import { botStateApi, BotState } from '@/services/botStateApi'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Plus, Activity, DollarSign, Bot, TrendingUp, TrendingDown, WifiOff } from 'lucide-react'
import { CreateBotDialog } from '@/components/bots/CreateBotDialog'
import { isBotOnline } from '@/lib/utils'

// Mock data structure for exchanges and accounts
const EXCHANGES_DATA = [
  {
    id: 'bybit-m',
    name: 'ByBit-M',
    accounts: [
      { id: 'aiverse', name: 'AiVerse' },
    ],
  },
  {
    id: 'bybit-s',
    name: 'ByBit-S',
    accounts: [
      { id: 'mars-1-3', name: 'MARS 1.3' },
    ],
  },
  {
    id: 'bitget-k',
    name: 'BitGet-K',
    accounts: [
      { id: 'attic-2', name: 'Attic-2' },
      { id: 'k-2', name: 'K-2' },
    ],
  },
  {
    id: 'bitget-m',
    name: 'BitGet-M',
    accounts: [
      { id: 'attic', name: 'Attic' },
      { id: 'bricklab', name: 'BrickLab' },
      { id: 'mar', name: 'MAR' },
    ],
  },
]

export function BotsPage() {
  const navigate = useNavigate()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState<string>('all')
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [botStates, setBotStates] = useState<Record<string, BotState>>({})

  const { data: bots, isLoading } = useQuery({
    queryKey: ['bots'],
    queryFn: botsApi.getAll,
  })

  // Fetch bot states and refresh every 5 seconds
  useEffect(() => {
    const fetchBotStates = async () => {
      try {
        console.log('[BotsPage] Fetching bot states...')
        const states = await botStateApi.getAllBotStates()
        console.log('[BotsPage] Bot states received:', states)
        const statesMap: Record<string, BotState> = {}
        states.forEach(state => {
          console.log('[BotsPage] Processing state for bot:', state.botId)
          statesMap[state.botId] = state
        })
        console.log('[BotsPage] States map:', statesMap)
        setBotStates(statesMap)
      } catch (error) {
        console.error('[BotsPage] Failed to fetch bot states:', error)
      }
    }

    // Initial fetch
    console.log('[BotsPage] Starting bot state polling...')
    fetchBotStates()

    // Refresh every 5 seconds
    const interval = setInterval(fetchBotStates, 5000)

    return () => clearInterval(interval)
  }, [])

  // Get available accounts based on selected exchange
  const availableAccounts = useMemo(() => {
    if (selectedExchange === 'all') {
      return EXCHANGES_DATA.flatMap(exchange => exchange.accounts)
    }
    const exchange = EXCHANGES_DATA.find(ex => ex.id === selectedExchange)
    return exchange?.accounts || []
  }, [selectedExchange])

  // Reset account selection when exchange changes
  const handleExchangeChange = (value: string) => {
    setSelectedExchange(value)
    setSelectedAccount('all')
  }

  // Filter bots based on selected exchange and account
  const filteredBots = useMemo(() => {
    if (!bots) return []

    let filtered = bots

    // Filter by exchange
    if (selectedExchange !== 'all') {
      const exchangeName = EXCHANGES_DATA.find(ex => ex.id === selectedExchange)?.name
      filtered = filtered.filter(bot => {
        const botExchange = bot.exchange?.toLowerCase().replace(/\s+/g, '-')
        const selectedExch = exchangeName?.toLowerCase().replace(/\s+/g, '-')
        return botExchange === selectedExch
      })
    }

    // Filter by account
    if (selectedAccount !== 'all') {
      const accountName = availableAccounts.find(acc => acc.id === selectedAccount)?.name
      filtered = filtered.filter(bot => {
        const botAccount = bot.account?.toLowerCase()
        const selectedAcc = accountName?.toLowerCase()
        return botAccount === selectedAcc
      })
    }

    return filtered
  }, [bots, selectedExchange, selectedAccount, availableAccounts])

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    )
  }

  const activeBots = filteredBots?.filter(bot => bot.status === 'Active').length || 0
  const totalProfit = filteredBots?.reduce((sum, bot) => sum + (bot.statistics?.netProfit || 0), 0) || 0

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground">All Bots</h2>
            <p className="text-muted-foreground mt-1">Manage and monitor all your trading bots</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Bot
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bots</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredBots?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{activeBots} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalProfit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Exchange</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleExchangeChange('all')}
                    className={`
                      px-4 py-2 rounded-md text-sm font-medium transition-all
                      ${selectedExchange === 'all'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }
                    `}
                  >
                    All Exchanges
                  </button>
                  {EXCHANGES_DATA.map((exchange) => (
                    <button
                      key={exchange.id}
                      onClick={() => handleExchangeChange(exchange.id)}
                      className={`
                        px-4 py-2 rounded-md text-sm font-medium transition-all
                        ${selectedExchange === exchange.id
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }
                      `}
                    >
                      {exchange.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Account</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedAccount('all')}
                    className={`
                      px-4 py-2 rounded-md text-sm font-medium transition-all
                      ${selectedAccount === 'all'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }
                    `}
                  >
                    All Accounts
                  </button>
                  {availableAccounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => setSelectedAccount(account.id)}
                      className={`
                        px-4 py-2 rounded-md text-sm font-medium transition-all
                        ${selectedAccount === account.id
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }
                      `}
                    >
                      {account.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBots?.map((bot) => {
            const botState = botStates[bot.externalBotId || bot.id.toString()]

            // Check if bot is actually online based on last update time
            const isOnline = isBotOnline(botState?.lastUpdate)
            const isRunning = isOnline && (botState?.status?.isRunning ?? false)

            // Determine status text and color
            let statusText: string
            let statusColor: string
            let statusDot: string

            if (!isOnline) {
              statusText = 'Offline'
              statusColor = 'bg-red-100 text-red-700 border-red-200'
              statusDot = 'bg-red-500'
            } else if (isRunning) {
              statusText = 'Active'
              statusColor = 'bg-green-100 text-green-700 border-green-200'
              statusDot = 'bg-green-500 animate-pulse'
            } else {
              statusText = 'Stopped'
              statusColor = 'bg-gray-100 text-gray-700 border-gray-200'
              statusDot = 'bg-gray-400'
            }

            // Check if position data is fresh (updated within last 5 minutes)
            const positionTimestamp = botState?.position?.timestamp ? new Date(botState.position.timestamp).getTime() : 0
            const now = Date.now()
            const fiveMinutesInMs = 5 * 60 * 1000
            const isPositionDataFresh = isOnline && (now - positionTimestamp) < fiveMinutesInMs
            const hasActivePosition = botState?.position?.inPosition && isPositionDataFresh

            return (
            <Card
              key={bot.id}
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/bots/${bot.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{botState?.botName || bot.name || `Bot #${bot.id}`}</CardTitle>
                    <CardDescription className="mt-1">{bot.strategy}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isOnline && <WifiOff className="h-3.5 w-3.5 text-red-500" />}
                    <div className={`h-2 w-2 rounded-full ${statusDot}`} />
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Exchange</span>
                    <span className="font-medium">{bot.exchange || 'Unknown'}</span>
                  </div>
                  {bot.account && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Account</span>
                      <span className="font-medium">{bot.account}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Trading Pair</span>
                    <span className="font-medium">{bot.tradingPair || 'Unknown'}</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Balance</span>
                      </div>
                      {isOnline && isPositionDataFresh && botState?.position?.accountBalance ? (
                        <span className="font-semibold">
                          ${botState.position.accountBalance.toFixed(2)}
                        </span>
                      ) : (
                        <span className="font-semibold">
                          ${bot.currentBalance.toFixed(2)}
                        </span>
                      )}
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

                  {/* Real-time Position Info */}
                  {hasActivePosition && botState?.position && (
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Position</span>
                        </div>
                        <span className={`font-medium ${
                          botState.position.positionSide === 'Long' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {botState.position.positionSide} ${botState.position.positionSize}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Entry</span>
                        <span className="font-medium">${botState.position.entryPrice.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Current</span>
                        <span className="font-medium">${botState.position.currentPrice.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5">
                          {botState.position.unrealizedPnL >= 0 ? (
                            <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                          )}
                          <span className="text-muted-foreground">Unrealized P&L</span>
                        </div>
                        <span className={`font-semibold ${
                          botState.position.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${botState.position.unrealizedPnL.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Last Update Time */}
                  {botState && (
                    <div className="pt-2 border-t">
                      <div className={`text-xs ${!isOnline ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {!isOnline ? 'Последнее обновление: ' : 'Last update: '}
                        {new Date(botState.lastUpdate).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {!botState && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-red-500 flex items-center gap-1">
                        <WifiOff className="h-3 w-3" />
                        Бот никогда не подключался
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
          })}
        </div>

        {filteredBots?.length === 0 && (
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

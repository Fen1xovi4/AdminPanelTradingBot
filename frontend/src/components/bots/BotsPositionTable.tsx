import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { isBotOnline } from '@/lib/utils'
import type { TradingBot } from '@/types'
import type { BotState } from '@/services/botStateApi'

interface BotTableRow {
  botId: number
  botName: string
  tradingPair: string
  positionSide: 'Long' | 'Short' | null
  positionSizeUsdt: number | null
  unrealizedPnL: number | null
  accountBalance: number | null
}

type SortField = 'botName' | 'tradingPair' | 'positionSide' | 'positionSizeUsdt' | 'unrealizedPnL' | 'accountBalance'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  direction: SortDirection
}

interface BotsPositionTableProps {
  bots: TradingBot[]
  botStates: Record<string, BotState>
}

export function BotsPositionTable({ bots, botStates }: BotsPositionTableProps) {
  const navigate = useNavigate()
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'positionSizeUsdt',
    direction: 'desc'
  })

  const tableData = useMemo((): BotTableRow[] => {
    if (!bots) return []

    return bots.map((bot) => {
      const botState = botStates[bot.externalBotId || bot.id.toString()]
      const isOnline = isBotOnline(botState?.lastUpdate)

      const positionTimestamp = botState?.position?.timestamp
        ? new Date(botState.position.timestamp).getTime()
        : 0
      const now = Date.now()
      const fiveMinutesInMs = 5 * 60 * 1000
      const isPositionDataFresh = isOnline && (now - positionTimestamp) < fiveMinutesInMs
      const hasValidPosition = isPositionDataFresh && botState?.position?.inPosition

      return {
        botId: bot.id,
        botName: botState?.status?.botName || botState?.botName || bot.name,
        tradingPair: bot.tradingPair,
        positionSide: hasValidPosition
          ? (botState.position!.positionSide as 'Long' | 'Short')
          : null,
        positionSizeUsdt: hasValidPosition
          ? botState.position!.positionSize * botState.position!.currentPrice
          : null,
        unrealizedPnL: hasValidPosition ? botState.position!.unrealizedPnL : null,
        accountBalance: isPositionDataFresh && botState?.position?.accountBalance
          ? botState.position.accountBalance
          : null,
      }
    })
  }, [bots, botStates])

  const sortedData = useMemo(() => {
    const sorted = [...tableData].sort((a, b) => {
      const aVal = a[sortConfig.field]
      const bVal = b[sortConfig.field]

      // Null values go to bottom
      if (aVal === null && bVal === null) return 0
      if (aVal === null) return 1
      if (bVal === null) return -1

      // String comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal)
        return sortConfig.direction === 'asc' ? comparison : -comparison
      }

      // Numeric comparison
      const numA = aVal as number
      const numB = bVal as number
      const comparison = numA - numB
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [tableData, sortConfig])

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortConfig.field !== field) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />
  }

  const formatPnL = (pnl: number | null) => {
    if (pnl === null) return null
    const sign = pnl >= 0 ? '+' : ''
    return `${sign}$${pnl.toFixed(2)}`
  }

  const formatSize = (size: number | null) => {
    if (size === null) return null
    return `$${size.toFixed(2)} USDT`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Positions Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile sort dropdown */}
        <div className="md:hidden flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={`${sortConfig.field}-${sortConfig.direction}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-')
              setSortConfig({
                field: field as SortField,
                direction: direction as SortDirection
              })
            }}
            className="text-sm border rounded-md px-2 py-1.5 bg-background"
          >
            <option value="positionSizeUsdt-desc">Size (High to Low)</option>
            <option value="positionSizeUsdt-asc">Size (Low to High)</option>
            <option value="unrealizedPnL-desc">PnL (High to Low)</option>
            <option value="unrealizedPnL-asc">PnL (Low to High)</option>
            <option value="accountBalance-desc">Balance (High to Low)</option>
            <option value="accountBalance-asc">Balance (Low to High)</option>
            <option value="botName-asc">Name (A-Z)</option>
            <option value="botName-desc">Name (Z-A)</option>
            <option value="tradingPair-asc">Pair (A-Z)</option>
          </select>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th
                  onClick={() => handleSort('botName')}
                  className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Bot Name</span>
                    <SortIndicator field="botName" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('tradingPair')}
                  className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Pair</span>
                    <SortIndicator field="tradingPair" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('positionSide')}
                  className="px-4 py-3 text-center text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Side</span>
                    <SortIndicator field="positionSide" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('positionSizeUsdt')}
                  className="px-4 py-3 text-right text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Position Size</span>
                    <SortIndicator field="positionSizeUsdt" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unrealizedPnL')}
                  className="px-4 py-3 text-right text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Unrealized PnL</span>
                    <SortIndicator field="unrealizedPnL" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('accountBalance')}
                  className="px-4 py-3 text-right text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Balance</span>
                    <SortIndicator field="accountBalance" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row) => (
                <tr
                  key={row.botId}
                  onClick={() => navigate(`/bots/${row.botId}`)}
                  className="border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium">{row.botName}</td>
                  <td className="px-4 py-3 text-sm">{row.tradingPair}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    {row.positionSide ? (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.positionSide === 'Long'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}
                      >
                        {row.positionSide}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">&mdash;</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {row.positionSizeUsdt !== null ? (
                      <span className="font-medium">{formatSize(row.positionSizeUsdt)}</span>
                    ) : (
                      <span className="text-muted-foreground">&mdash;</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {row.unrealizedPnL !== null ? (
                      <span
                        className={`font-medium ${
                          row.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatPnL(row.unrealizedPnL)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">&mdash;</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {row.accountBalance !== null ? (
                      <span className="font-medium">${row.accountBalance.toFixed(2)}</span>
                    ) : (
                      <span className="text-muted-foreground">&mdash;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {sortedData.map((row) => (
            <div
              key={row.botId}
              onClick={() => navigate(`/bots/${row.botId}`)}
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium">{row.botName}</div>
                  <div className="text-sm text-muted-foreground">{row.tradingPair}</div>
                </div>
                {row.positionSide && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.positionSide === 'Long'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {row.positionSide}
                  </span>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Position Size</span>
                <span className="font-medium">
                  {row.positionSizeUsdt !== null ? formatSize(row.positionSizeUsdt) : '\u2014'}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Unrealized PnL</span>
                <span
                  className={
                    row.unrealizedPnL !== null
                      ? row.unrealizedPnL >= 0
                        ? 'text-green-600 font-medium'
                        : 'text-red-600 font-medium'
                      : 'text-muted-foreground'
                  }
                >
                  {row.unrealizedPnL !== null ? formatPnL(row.unrealizedPnL) : '\u2014'}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-medium">
                  {row.accountBalance !== null ? `$${row.accountBalance.toFixed(2)}` : '\u2014'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {sortedData.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No bots available
          </div>
        )}
      </CardContent>
    </Card>
  )
}

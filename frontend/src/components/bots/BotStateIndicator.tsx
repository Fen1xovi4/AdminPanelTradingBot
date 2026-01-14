import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BotState } from '@/services/botStateApi'
import { Activity, TrendingUp, TrendingDown, Circle, Target, ChevronUp, ChevronDown } from 'lucide-react'

interface BotStateIndicatorProps {
  botId: string
  botState?: BotState | null
}

export function BotStateIndicator({ botState }: BotStateIndicatorProps) {
  if (!botState) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground text-sm">
            <Circle className="h-4 w-4 inline mr-2" />
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const isRunning = botState.status?.isRunning ?? false
  const inPosition = botState.position?.inPosition ?? false
  const pnl = botState.position?.unrealizedPnL ?? 0

  return (
    <Card className={isRunning ? 'border-green-200' : 'border-gray-200'}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">Bot Status</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-xs font-medium">
              {botState.status?.status || 'Unknown'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Position Status */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Position</span>
          </div>
          <span className={`font-medium ${inPosition ? 'text-blue-600' : 'text-gray-500'}`}>
            {inPosition ? botState.position?.positionSide || 'Active' : 'No Position'}
          </span>
        </div>

        {/* Strategy Signal Info */}
        {!inPosition && botState.strategySignal && (
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
              <Target className="h-3.5 w-3.5" />
              <span>Waiting for Entry Signal</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Long Signal */}
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <ChevronUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-600">Long</span>
                </div>
                <div className="text-xs">
                  {botState.strategySignal.longReady ? (
                    <span className="font-semibold text-green-600">✓ Ready</span>
                  ) : (
                    <span className="text-muted-foreground">
                      {botState.strategySignal.longBars}/{botState.strategySignal.threshold} bars
                    </span>
                  )}
                </div>
              </div>
              {/* Short Signal */}
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <ChevronDown className="h-3 w-3 text-red-600" />
                  <span className="text-xs font-medium text-red-600">Short</span>
                </div>
                <div className="text-xs">
                  {botState.strategySignal.shortReady ? (
                    <span className="font-semibold text-red-600">✓ Ready</span>
                  ) : (
                    <span className="text-muted-foreground">
                      {botState.strategySignal.shortBars}/{botState.strategySignal.threshold} bars
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* EMA Value */}
            {botState.strategySignal.indicatorValue !== null && (
              <div className="flex justify-between text-xs pt-1">
                <span className="text-muted-foreground">EMA</span>
                <span className="font-medium">${botState.strategySignal.indicatorValue.toFixed(2)}</span>
              </div>
            )}
            {/* Additional Info */}
            {botState.strategySignal.additionalInfo && (
              <div className="text-xs text-muted-foreground italic pt-1">
                {botState.strategySignal.additionalInfo}
              </div>
            )}
          </div>
        )}

        {/* Position Details */}
        {inPosition && botState.position && (
          <>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Entry Price</span>
                <span className="font-medium">${botState.position.entryPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Current Price</span>
                <span className="font-medium">${botState.position.currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Take Profit</span>
                <span className="font-medium text-green-600">${botState.position.takeProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Stop Loss</span>
                <span className="font-medium text-red-600">${botState.position.stopLoss.toFixed(2)}</span>
              </div>
            </div>

            {/* Unrealized P&L */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {pnl >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-xs text-muted-foreground">Unrealized P&L</span>
                </div>
                <span className={`text-sm font-bold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${pnl.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Last Update */}
        <div className="border-t pt-2">
          <div className="text-xs text-muted-foreground">
            Last update: {new Date(botState.lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

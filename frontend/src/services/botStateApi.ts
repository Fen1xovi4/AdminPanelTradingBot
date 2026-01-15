import api from './api'

export interface BotStatus {
  botId: string
  botName?: string
  exchange?: string
  account?: string
  isRunning: boolean
  status: string
  timestamp: string
}

export interface Position {
  botId: string
  inPosition: boolean
  entryPrice: number
  takeProfit: number
  stopLoss: number
  positionSize: number
  currentPrice: number
  unrealizedPnL: number
  positionSide: string
  accountBalance: number
  timestamp: string
}

export interface StrategySignal {
  longReady: boolean
  longBars: number
  shortReady: boolean
  shortBars: number
  indicatorValue: number | null
  threshold: number
  additionalInfo: string | null
}

export interface BotState {
  botId: string
  botName: string
  exchange: string
  account: string
  status: BotStatus | null
  position: Position | null
  strategySignal: StrategySignal | null
  lastUpdate: string
}

export const botStateApi = {
  // Get state of a specific bot
  getBotState: async (botId: string): Promise<BotState> => {
    const response = await api.get<BotState>(`/botstate/${botId}`)
    return response.data
  },

  // Get states of all bots
  getAllBotStates: async (): Promise<BotState[]> => {
    const response = await api.get<BotState[]>('/botstate')
    return response.data
  },
}

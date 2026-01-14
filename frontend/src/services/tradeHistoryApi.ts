import api from './api'
import type { TradeHistory, CreateTradeHistoryRequest } from '@/types'

export const tradeHistoryApi = {
  getAll: async (): Promise<TradeHistory[]> => {
    const response = await api.get<TradeHistory[]>('/tradehistory')
    return response.data
  },

  getByBotId: async (botId: number): Promise<TradeHistory[]> => {
    const response = await api.get<TradeHistory[]>(`/tradehistory/bot/${botId}`)
    return response.data
  },

  create: async (botId: number, data: CreateTradeHistoryRequest): Promise<TradeHistory> => {
    const response = await api.post<TradeHistory>(`/tradehistory/bot/${botId}`, data)
    return response.data
  },
}

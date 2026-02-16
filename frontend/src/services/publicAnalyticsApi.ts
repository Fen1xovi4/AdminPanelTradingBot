import axios from 'axios'

const publicApi = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface ChartPoint {
  date: string
  fullDate: string
  pnl: number
}

export interface PublicAnalyticsData {
  totalProfit: number
  totalTrades: number
  winningTrades: number
  winRate: number
  activeBots: number
  totalBots: number
  period: string
  chartData: ChartPoint[]
}

export const publicAnalyticsApi = {
  getAnalytics: async (period: string = 'all'): Promise<PublicAnalyticsData> => {
    const response = await publicApi.get<PublicAnalyticsData>(
      `/publicanalytics?period=${period}`
    )
    return response.data
  },
}

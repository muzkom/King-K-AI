
export enum AppScreen {
  ONBOARDING = 'ONBOARDING',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  ANALYSIS = 'ANALYSIS',
  ASSISTANT = 'ASSISTANT',
  PROFILE = 'PROFILE'
}

export interface ConfluenceFactor {
  factor: string;
  strength: number; // 0-100
  status: 'Verified' | 'Detected' | 'Pending';
}

export interface TradeAnalysisResult {
  id: string;
  timestamp: number;
  pair: string;
  trend: 'Bullish' | 'Bearish' | 'Ranging';
  tradeIdea: 'Buy' | 'Sell' | 'Wait';
  entry: string; // "Entry Point"
  sl: string;    // "Stop Loss"
  tp1: string;   // "Take Profit 1"
  tp2: string;   // "Take Profit 2"
  rr: string;
  reasoning: string;
  confidence: 'High' | 'Medium' | 'Low';
  confluenceFactors: ConfluenceFactor[];
  recommendedLotSize?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

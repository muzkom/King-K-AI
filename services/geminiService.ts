
import { GoogleGenAI, Type } from "@google/genai";
import { TradeAnalysisResult } from "../types";

// Always use named parameter for apiKey and obtain it directly from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeChartImage = async (
  base64Images: string[], 
  pair: string, 
  style: 'Scalp' | 'Swing'
): Promise<TradeAnalysisResult> => {
  try {
    const model = 'gemini-3-pro-preview'; 

    const imageParts = base64Images.map(img => ({
      inlineData: {
        mimeType: "image/png", 
        data: img
      }
    }));

    const prompt = `Act as the King K Deep Pro Analyst. THIS IS FOR HIGH-STAKES REAL MONEY.
    
    CRITICAL ANALYSIS PROTOCOL:
    1. Multi-Timeframe Confirmation: Compare HTF structure with LTF entries.
    2. Structural Integrity: Identify BOS (Break of Structure) and CHoCH (Change of Character).
    3. Institutional Zones: Mark clear Order Blocks (OB) and Fair Value Gaps (FVG).
    4. Liquidity: Identify Inducement levels and Liquidity Pools (BSL/SSL).
    
    TERMINOLOGY MANDATE:
    You MUST output exactly these labels: "Entry Point", "Stop Loss", "Take Profit 1", "Take Profit 2".
    
    Return a detailed JSON response including a list of "confluenceFactors" where you list specific SMC/ICT signals found.
    
    Return strict JSON only.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          ...imageParts,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pair: { type: Type.STRING },
            trend: { type: Type.STRING, enum: ["Bullish", "Bearish", "Ranging"] },
            tradeIdea: { type: Type.STRING, enum: ["Buy", "Sell", "Wait"] },
            entry: { type: Type.STRING, description: "Entry Point" },
            sl: { type: Type.STRING, description: "Stop Loss" },
            tp1: { type: Type.STRING, description: "Take Profit 1" },
            tp2: { type: Type.STRING, description: "Take Profit 2" },
            rr: { type: Type.STRING },
            confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            reasoning: { type: Type.STRING },
            confluenceFactors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  factor: { type: Type.STRING, description: "e.g. BOS Detected, FVG Tap, SSL Swept" },
                  strength: { type: Type.NUMBER, description: "1-100" },
                  status: { type: Type.STRING, enum: ["Verified", "Detected", "Pending"] }
                },
                required: ["factor", "strength", "status"]
              }
            }
          },
          required: ["pair", "trend", "tradeIdea", "entry", "sl", "tp1", "tp2", "rr", "confidence", "reasoning", "confluenceFactors"]
        }
      }
    });

    // Directly accessing .text property as per guidelines
    const textResult = response.text;
    if (textResult) {
      const data = JSON.parse(textResult);
      return {
        ...data,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      } as TradeAnalysisResult;
    }
    throw new Error("Neural link failed.");
  } catch (error) {
    console.error("Deep Scan Error:", error);
    throw error;
  }
};

export const chatWithAssistant = async (message: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
    try {
        const chat = ai.chats.create({
            model: 'gemini-3-pro-preview',
            history: history,
            config: {
                systemInstruction: `You are King K, the institutional trading guru. 
                - Use professional terminology: Entry Point, Stop Loss, Take Profit.
                - Focus on SMC/ICT logic.
                - Tone: Sharp, clinical, authoritative.`
            }
        });
        const result = await chat.sendMessage({ message });
        // Directly accessing .text property
        return result.text || "Connection lost.";
    } catch (e) {
        return "Internal neural loop error.";
    }
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

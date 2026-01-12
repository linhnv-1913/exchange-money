import { GoogleGenAI, Type } from "@google/genai";
import { ExchangeRates } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchCurrentRates = async (): Promise<ExchangeRates> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Find the current exact exchange rate for 1 USD to VND, 1 JPY to VND. Also find the current SJC Gold price in Vietnam (Buy and Sell price per 1 tael/lượng in VND) by searching specifically on sjc.com.vn. Return pure numeric values.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            usd: { type: Type.NUMBER, description: "Current rate of 1 USD in VND" },
            jpy: { type: Type.NUMBER, description: "Current rate of 1 JPY in VND" },
            gold: {
              type: Type.OBJECT,
              properties: {
                buy: { type: Type.NUMBER, description: "SJC Gold Buy price per tael (lượng) in VND" },
                sell: { type: Type.NUMBER, description: "SJC Gold Sell price per tael (lượng) in VND" }
              },
              required: ["buy", "sell"]
            }
          },
          required: ["usd", "jpy", "gold"]
        }
      },
    });

    const data = JSON.parse(response.text || '{}');
    
    // Validate response
    if (!data.usd || !data.jpy || !data.gold) {
        throw new Error("Invalid data format received from Gemini");
    }

    return {
      usd: data.usd,
      jpy: data.jpy,
      gold: {
        buy: data.gold.buy,
        sell: data.gold.sell
      },
      lastUpdated: new Date().toLocaleString('vi-VN')
    };
  } catch (error) {
    console.error("Error fetching rates:", error);
    // Fallback values if API fails
    return {
      usd: 25400,
      jpy: 165,
      gold: {
        buy: 82000000,
        sell: 84000000
      },
      lastUpdated: `Lỗi cập nhật. Sử dụng số liệu ước tính.`
    };
  }
};

import { GoogleGenAI, Type } from "@google/genai";

/**
 * Checks the current status of the API key and quota.
 */
export const testConnection = async (): Promise<{ status: 'ready' | 'limit' | 'error' | 'billing', message: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'ping',
      config: { 
        maxOutputTokens: 1,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    if (response.text) {
      return { status: 'ready', message: 'API is online and quota is available.' };
    }
    return { status: 'error', message: 'Unexpected response from API.' };
  } catch (error: any) {
    console.error("Diagnostic Error:", error);
    const msg = error.message?.toLowerCase() || '';
    if (msg.includes('429') || msg.includes('quota')) {
      return { status: 'limit', message: 'Free tier quota reached. Upgrade for higher limits.' };
    }
    if (msg.includes('billing') || msg.includes('403') || msg.includes('not found')) {
      return { status: 'billing', message: 'Paid API key required for this feature.' };
    }
    return { status: 'error', message: 'Connection issue or invalid key.' };
  }
};

export const getHolidayRecommendation = async (
  preferences: string,
  destinationType: string,
  startDate: string,
  endDate: string,
  guests: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Act as an elite travel concierge for "Dream it marketing". 
      Based on these trip details:
      - Preferred Environment: ${destinationType}
      - Travel Window: ${startDate} to ${endDate}
      - Party Size: ${guests} guest(s)
      - Personal Desires: "${preferences}"

      Provide a 3-sentence luxury vacation recommendation that highlights the importance of "time" and "effortless experiences". 
      Focus on high-end quality and the brand's exclusive South African portfolio. 
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "We've imagined a beautiful stay for you. Let's make it a reality.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes('429')) return "Quota reached. The free tier is currently resting. Please try again in a minute.";
    return "The dream is temporarily out of reach. Please ensure your API key is active.";
  }
};

/**
 * Generates a high-quality image using Gemini 3 Pro Image Preview
 */
export const generateImage = async (prompt: string, aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "3:4"): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: "1K"
      },
    },
  });

  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error("No candidates returned from image generation.");

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data part found in the model response.");
};

export const getBudgetEstimate = async (params: {
  destination: string;
  adults: number;
  children: number;
  tier: 'Standard' | 'Premium' | 'Ultra-Luxe';
  startDate: string;
  endDate: string;
}) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Calculate a realistic luxury vacation budget for a stay at "${params.destination}".
      Check-In: ${params.startDate}
      Check-Out: ${params.endDate}
      Party: ${params.adults} adults, ${params.children} children.
      Luxury Tier: ${params.tier}

      Generate a JSON response for member vs market comparison.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isPortfolioResort: { type: Type.BOOLEAN },
            nights: { type: Type.INTEGER },
            days: { type: Type.INTEGER },
            seasonType: { type: Type.STRING },
            marketCost: { type: Type.NUMBER },
            memberCost: { type: Type.NUMBER },
            perNightMarket: { type: Type.NUMBER },
            perNightMember: { type: Type.NUMBER },
            inclusions: { type: Type.ARRAY, items: { type: Type.STRING } },
            insight: { type: Type.STRING }
          },
          required: ["isPortfolioResort", "nights", "days", "seasonType", "marketCost", "memberCost", "perNightMarket", "perNightMember", "inclusions", "insight"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    data.savingsPercentage = Math.round(((data.marketCost - data.memberCost) / data.marketCost) * 100);
    return data;
  } catch (error: any) {
    console.error("Budget AI Error:", error);
    if (error.message?.includes('429')) throw new Error("QUOTA_EXHAUSTED");
    throw error;
  }
};

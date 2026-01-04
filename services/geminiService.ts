
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Checks the current status of the API key and quota.
 */
export const testConnection = async (): Promise<{ status: 'ready' | 'limit' | 'error', message: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Use the lightest model for a quick heartbeat check.
    // Added thinkingBudget: 0 because maxOutputTokens is set, as per guidelines for 2.5/3 series models.
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
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
    if (error.message?.includes('429') || error.message?.toLowerCase().includes('quota')) {
      return { status: 'limit', message: 'Daily quota has been reached (429).' };
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
      The tone should be sophisticated, inviting, and reassuring.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "We've imagined a beautiful stay for you. Let's make it a reality.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating your dream. Please try again.";
  }
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

      LUXURY TIER DEFINITIONS (Market Anchors):
      - Standard: Comfortable & Authentic. High-quality 4-star self-catering or hotels. Public Market: R2,500 - R4,000/night.
      - Premium: Superior Luxury. 5-star finishes, prime resort locations, and expansive suites. Public Market: R5,500 - R9,500/night.
      - Ultra-Luxe: The Pinnacle of Travel. Exclusive penthouses, private villas, and bespoke concierge services. Public Market: R15,000 - R35,000/night.

      SEASONAL INTELLIGENCE (South African Context):
      - Peak (Dec 15 - Jan 10, Easter): Market prices surge by 50-100%. 
      - Mid-Peak (Sept, Oct, April): High demand, standard luxury rates.
      - Off-Peak (May - Aug): Market prices often discounted.
      
      DREAM CLUB ADVANTAGE:
      Member costs (points/levies) stay mostly stable regardless of Tier or Season. 
      Show how the member advantage grows exponentially at higher tiers.

      Generate a JSON response with:
      1. isPortfolioResort: boolean
      2. nights: number (the number of nights between dates)
      3. days: number (usually nights + 1, representing the full duration)
      4. seasonType: string
      5. marketCost: Total public price for the stay (Tier & Season adjusted).
      6. memberCost: Total price for members (Maintenance/Points equivalent).
      7. perNightMarket: Average public nightly rate.
      8. perNightMember: Average member nightly rate.
      9. inclusions: 3 high-end perks based on the TIER.
      10. insight: A sophisticated tip about the financial wisdom of this tier and date.
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
            savingsPercentage: { type: Type.INTEGER },
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
  } catch (error) {
    console.error("Budget AI Error:", error);
    throw error;
  }
};

export const getNearbyExperiences = async (destination: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Find 3-4 top-rated luxury hidden gems or exclusive experiences near ${destination}. 
    Focus on high-end dining, private spa retreats, or unique local landmarks. 
    Provide a short 1-sentence description for each.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const experiences = chunks
      .filter((chunk: any) => chunk.maps && (chunk.maps.uri || chunk.maps.placeAnswerSources))
      .map((chunk: any) => {
        const maps = chunk.maps;
        const reviewSnippets = maps.placeAnswerSources?.flatMap((source: any) => source.reviewSnippets || []) || [];
        
        return {
          title: maps.title || "Elite Experience",
          uri: maps.uri || (maps.placeAnswerSources?.[0]?.uri),
          snippets: reviewSnippets
        };
      });

    return {
      text: response.text,
      links: experiences
    };
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return null;
  }
};

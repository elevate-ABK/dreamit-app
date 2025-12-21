
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const getHolidayRecommendation = async (
  preferences: string,
  destinationType: string,
  startDate: string,
  endDate: string,
  guests: string
): Promise<string> => {
  if (!API_KEY) return "AI services are currently unavailable. Please contact us directly!";

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  try {
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
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text || "We've imagined a beautiful stay for you. Let's make it a reality.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating your dream. Please try again.";
  }
};

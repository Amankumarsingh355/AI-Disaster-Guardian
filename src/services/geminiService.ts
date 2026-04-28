import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface DisasterResponse {
  status: "Green" | "Red";
  message: string;
  riskLevel: "Low" | "High";
  hazards: string[];
  nearbyAlerts: string[];
  safetyTips: string[];
}

export async function analyzeLocation(lat: number, lng: number): Promise<DisasterResponse> {
  const prompt = `You are an AI Disaster Agent. Analyze the coordinates (Lat: ${lat}, Lng: ${lng}) and the surrounding area (20km radius) for potential disaster risks such as wildfires, floods, or earthquakes. 
  
  Return a JSON response with:
  - status: "Green" (Safe) or "Red" (Danger)
  - message: A summary of the current situation.
  - riskLevel: "Low" or "High".
  - hazards: Specific types of disasters detected (e.g., ["Flash Flood", "Wildfire"]).
  - nearbyAlerts: Any threats within a 10-20km range.
  - safetyTips: 3 actionable, specific safety steps based on the detected risks.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { 
              type: Type.STRING, 
              enum: ["Green", "Red"],
            },
            message: { 
              type: Type.STRING,
            },
            riskLevel: { 
              type: Type.STRING,
              enum: ["Low", "High"]
            },
            hazards: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            nearbyAlerts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            safetyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            }
          },
          required: ["status", "message", "riskLevel", "hazards", "nearbyAlerts", "safetyTips"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as DisasterResponse;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze disaster risks.");
  }
}

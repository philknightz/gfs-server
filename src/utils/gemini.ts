import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../constant/config";
import { PLACE_TYPES } from "../constant/value/activities";
import { GooglePlaceResult } from "./geocoding";

const genAI = new GoogleGenerativeAI(config.google.apiKey);

export async function getRecommendationsCategoryFromGemini({
  userLocation,
  currentTime,
  weatherInfo,
  recentVisitedPlaceTypes,
  completedActivities,
  averageDailySpending = 1000000,
  spendingInDay = 0,
}: {
  userLocation: string;
  currentTime: string;
  weatherInfo: string;
  recentVisitedPlaceTypes: string[];
  completedActivities: string[];
  averageDailySpending?: number;
  spendingInDay?: number;
}) {
  const prompt = `
    You are an expert travel assistant AI.

    I am currently traveling in **${userLocation}**, at **${currentTime}**. The current weather is: **${weatherInfo}**.

    Here are the ONLY allowed place types in this system (tokens must match EXACTLY):
    ${PLACE_TYPES.map((type) => `- ${type}`).join("\n")}

    In the past few days, I have visited or spent money on the following place types:
    ${recentVisitedPlaceTypes.map((type) => `- ${type}`).join("\n")}

    My average daily spending is: **${averageDailySpending}**. My spending today is: **${spendingInDay}**.

    I have done the following activities today:
    ${completedActivities.map((activity) => `- ${activity}`).join("\n")}

    I want to enjoy the rest of my trip with the most interesting, enjoyable, and refreshing experiences possible.

    Please suggest EXACTLY 3 place types that I should explore next.
    IMPORTANT:
    - Choose ONLY from the allowed list above.
    - Use the tokens EXACTLY as shown (case and underscores must match).
    - Output MUST be a single line: three tokens separated by commas, and nothing else.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
      },
    });
    const response = result.response;
    const text = response?.text();
    return text?.replace(/\n/g, "").trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function rankNearbyPlacesWithReasons({
  userLocation,
  currentTime,
  weatherInfo,
  candidatePlaces,
}: {
  userLocation: string;
  currentTime: string;
  weatherInfo: string;
  candidatePlaces: Record<string, GooglePlaceResult[]>;
}) {
  const list = Object.entries(candidatePlaces)
    .map(([type, places]) => {
      const rows = places
        .map(
          (p) =>
            `- id:${p.place_id} | name:${p.name} | type:${type} | rating:${p.rating ?? ""} | reviews:${
              p.user_ratings_total ?? 0
            } | open:${p.open_now ?? ""} | address:${p.address ?? ""}`
        )
        .join("\n");
      return `Type: ${type}\n${rows}`;
    })
    .join("\n\n");

  const prompt = `
You are a local travel guide AI.
Context:
- Location: ${userLocation}
- Time now: ${currentTime}
- Weather: ${weatherInfo}

Given the following nearby places (grouped by type), filter out those that are not really worth visiting for tourists (e.g., offices, generic stores not interesting to tourists, etc.). Then rank the remaining ones by how worthwhile they are to visit NOW. For each item, provide a short reason tailored to a traveler.

Nearby candidates:
${list}

Remove places that are not worth visiting for tourists

Return a valid JSON with this exact shape:
{
  "ranked": [
    {
      "place_id": "...",
      "name": "...",
      "type": "...",
      "reason": "...",
      "score": 0-100
    }
  ]
}
Only JSON. No extra text.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
      },
    });
    const text = result.response.text();
    return text;
  } catch (error) {
    console.error("Gemini Rank API Error:", error);
    throw error;
  }
}

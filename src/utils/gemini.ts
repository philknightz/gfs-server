import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../constant/config";
import { ACTIVITIES } from "../constant/value/activities";

const genAI = new GoogleGenerativeAI(config.google.apiKey);

export async function getRecommendationsFromGemini({
  user_location,
  time_of_day,
  completed_activities,
  in_day_completed_activities,
  in_trip_completed_activities,
  preferences,
}: {
  user_location: string;
  time_of_day: string;
  completed_activities: string[];
  in_trip_completed_activities: string[];
  in_day_completed_activities: string[];
  preferences: string[];
}) {
  const prompt = `
    I am currently in ${user_location}. 
    ${
      in_trip_completed_activities.length > 0
        ? `So far today (${time_of_day}), I have done: ${in_trip_completed_activities.join(", ")}.`
        : ""
    }
    ${in_day_completed_activities.length > 0 ? `To day, I have done: ${in_day_completed_activities.join(", ")}.` : ""}
    In general, I also enjoy these types of activities: ${completed_activities.join(", ")}.
    My travel preferences include: ${preferences.join(", ")}.

    Based on the above, suggest the next 3 most suitable **activity categories** I should explore this afternoon. 
    Please choose from the following predefined categories only and do not include specific places:

    ${ACTIVITIES.map((item) => `- ${item}`).join("\n")}}

    Respond with **only the top 3 most relevant categories**. Do not include any other text.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

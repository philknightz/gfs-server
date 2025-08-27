import { Request, Response } from "express";
import { defaultError, response } from "../utils/response";
import { getRecommendationsFromGemini } from "../utils/gemini";

export const recommend = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const {
      user_location,
      time_of_day,
      completed_activities = [],
      in_day_completed_activities = [],
      in_trip_completed_activities = [],
      preferences = [],
    } = req.body ?? {};

    if (!user_location || !time_of_day) {
      return response(res, { message: "user_location and time_of_day are required" }, 400);
    }

    const text = await getRecommendationsFromGemini({
      user_location,
      time_of_day,
      completed_activities,
      in_day_completed_activities,
      in_trip_completed_activities,
      preferences,
    });

    return response(res, { text });
  } catch (e) {
    defaultError(res, e);
  }
};

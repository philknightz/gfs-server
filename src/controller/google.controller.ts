import { Request, Response } from "express";
import { defaultError, response } from "../utils/response";
import { getRecommendationsCategoryFromGemini, rankNearbyPlacesWithReasons } from "../utils/gemini";
import { findNearbyPlaces, reverseGeocode, getPlacePhotoUrl } from "../utils/geocoding";
import moment from "moment-timezone";
import { getWeatherInfo } from "../utils/weather";
import { parseAIJson } from "../utils/json";

export const recommend = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { latitude, longitude } = req.body ?? {};
    const currentTime = moment().tz("Asia/Ho_Chi_Minh").locale("en").format("dddd, DD/MM/YYYY HH:mm");

    const [userLocation, weatherInfo] = await Promise.all([
      reverseGeocode(Number(latitude), Number(longitude)),
      getWeatherInfo(Number(latitude), Number(longitude)),
    ]);

    const text = await getRecommendationsCategoryFromGemini({
      userLocation,
      currentTime,
      weatherInfo,
      recentVisitedPlaceTypes: [],
      completedActivities: [],
    });

    const nearbyPlaces = await findNearbyPlaces(
      Number(latitude),
      Number(longitude),
      text.split(",")?.map((t) => t.trim()) ?? []
    );

    const rankedJson = await rankNearbyPlacesWithReasons({
      userLocation,
      currentTime,
      weatherInfo,
      candidatePlaces: nearbyPlaces,
    });

    const ranked = parseAIJson(rankedJson);

    return response(res, { text, nearbyPlaces, ranked: (ranked as any)?.ranked ?? [] });
  } catch (e) {
    defaultError(res, e);
  }
};

export const placeInfo = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params ?? {};
    const url = await getPlacePhotoUrl(id);
    if (!url) return response(res, { url: "" });
    return response(res, url);
  } catch (e) {
    defaultError(res, e);
  }
};

export const placeView = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { place_id } = req.body ?? {};
  } catch (e) {
    defaultError(res, e);
  }
};

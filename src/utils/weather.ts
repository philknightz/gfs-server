import axios from "axios";

const weatherCodes: Record<number, string> = {
  0: "clear sky",
  1: "mainly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "fog",
  48: "depositing rime fog",
  51: "light drizzle",
  53: "moderate drizzle",
  55: "dense drizzle",
  56: "light freezing drizzle",
  57: "dense freezing drizzle",
  61: "slight rain",
  63: "moderate rain",
  65: "heavy rain",
  66: "light freezing rain",
  67: "heavy freezing rain",
  71: "slight snow fall",
  73: "moderate snow fall",
  75: "heavy snow fall",
  77: "snow grains",
  80: "slight rain showers",
  81: "moderate rain showers",
  82: "violent rain showers",
  85: "slight snow showers",
  86: "heavy snow showers",
  95: "thunderstorm",
  96: "thunderstorm with slight hail",
  99: "thunderstorm with heavy hail",
};

export function getWeatherDescription(code: number): string {
  return weatherCodes[code] ?? "unknown";
}

export async function getWeatherInfo(
  latitude: number,
  longitude: number,
  timezone = "Asia/Ho_Chi_Minh"
): Promise<string> {
  const url = "https://api.open-meteo.com/v1/forecast";
  const params = {
    latitude: latitude || 21.015585038538845,
    longitude: longitude || 105.81942760708606,
    current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
    timezone: timezone || "Asia/Ho_Chi_Minh",
  } as const;

  const response = await axios.get(url, { params });
  const weatherCode: number = response?.data?.current?.weather_code;
  return getWeatherDescription(weatherCode);
}

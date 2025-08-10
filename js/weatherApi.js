import { WEATHERAPI_KEY } from "./config.js";
import { getYesterdayDate } from "./dataHelpers.js";

export async function fetchWeatherByCity(city, unit) {
  // WeatherAPI uses 'q' for location and 'key' for API key
  // unit: 'imperial' => 'f', 'metric' => 'c'
  const weatherUnit = unit === "imperial" ? "f" : "c";
  const response = await fetch(
    `https://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_KEY}&q=${encodeURIComponent(
      city
    )}&aqi=no`
  );
  const data = await response.json();
  if (!response.ok || !data.current) {
    throw new Error(
      data.error?.message || "Could not retrieve weather data for " + city + "."
    );
  }
  // Attach unit for downstream use
  data.unit = weatherUnit;
  return data;
}

// Fetch weather data by user's coordinates
export async function fetchWeatherByCoords(latitude, longitude, unit) {
  const weatherUnit = unit === "imperial" ? "f" : "c";

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_KEY}&q=${latitude},${longitude}&aqi=no`
    );
    const data = await response.json();
    if (!response.ok || !data.current) {
      throw new Error(
        data.error?.message || "Could not retrieve weather data for the location."
      );
    }

    data.unit = weatherUnit;
    return data;

  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
  
}

// Fetch hourly weather data
export async function fetchHourlyWeather(latitude, longitude, unit) {
  const weatherUnit = unit === "imperial" ? "f" : "c";

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${latitude},${longitude}&days=3&aqi=no`
    );
    const data = await response.json();
    if (!response.ok || !data.forecast) {
    throw new Error(
      data.error?.message || "Could not retrieve hourly weather data."
    );
  }
  data.unit = weatherUnit;
  return data;

  } catch (error) {
    console.error("Error fetching hourly forecast:", error);
    throw error;
  }
}



// Fetch yesterday's weather data
export async function fetchYesterdayWeather(latitude, longitude, unit) {
  const weatherUnit = unit === "imperial" ? "f" : "c";
  const yesterday = getYesterdayDate();
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/history.json?key=${WEATHERAPI_KEY}&q=${latitude},${longitude}&dt=${yesterday}&aqi=no`
    );
    const data = await response.json();
    if (!response.ok || !data.forecast) {
      throw new Error(
        data.error?.message || "Could not retrieve yesterday's weather data."
      );
    }
    data.unit = weatherUnit;
    return data;

  } catch (error) {
    console.error("Error fetching yesterday's weather data:", error);
    throw error;
  }
}
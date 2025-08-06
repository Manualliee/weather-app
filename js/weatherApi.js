import { OPENWEATHER_API_KEY } from "./config.js";

export async function fetchWeatherByCity(city, unit) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=${unit}`
  );
  const data = await response.json();
  if (!response.ok || !data.weather) {
    throw new Error(
      data.message || "Could not retrieve weather data for " + city + "."
    );
  }
  return data;
}

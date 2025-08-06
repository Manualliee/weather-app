import { fetchWeatherByCity } from "./weatherApi.js";
import { OPENWEATHER_API_KEY } from "./config.js";

const form = document.getElementById("locationForm");
const geoButton = document.getElementById("geoButton");

// Handle form submission
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const locationInput = document.getElementById("locationInput");
  const location = locationInput.value;
  const unit = document.querySelector('input[name="unit"]:checked').value;

  document.getElementById(
    "getWeather"
  ).innerText = `Getting weather for ${location}`;

  try {
    const data = await fetchWeatherByCity(location, unit);
    if (data.weather) {
      // Math for time of day
      // Calculate local time based on the timezone offset
      const localTimestamp = data.dt + data.timezone; // seconds
      // Create a Date object for the local time
      // Convert seconds to milliseconds (multiply by 1000)
      const localDate = new Date(localTimestamp * 1000);
      // Format the local time to a readable string
      // Get hours and minutes in 12-hour format
      const hours = localDate.getUTCHours();
      console.log(hours);
      const minutes = localDate.getUTCMinutes();
      console.log(minutes);
      // Format the time as HH:MM AM/PM
      // Converts the hour from 24-hour format to 12-hour format.
      // If hours is 0, it should be 12 AM; if hours is 12, it should be 12 PM.
      const formattedTime = `${hours % 12 || 12}:${minutes
        .toString()
        .padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
      console.log(`Local time: ${formattedTime}`);

      // Round the temperature to the nearest whole number
      const wholeTemperature = Math.round(data.main.temp);

      document.getElementById(
        "getWeather"
      ).innerText = `Weather in ${location}: ${
        data.weather[0].description
      } with a temperature of ${wholeTemperature}${
        unit === "imperial" ? "°F" : "°C"
      }.`;
    } else {
      document.getElementById(
        "getWeather"
      ).innerText = `Could not retrieve weather data for ${location}.`;
    }
  } catch (error) {
    document.getElementById(
      "getWeather"
    ).innerText = `Error fetching weather data: ${error.message}`;
  }
});

// Handle geolocation button click
geoButton.addEventListener("click", async () => {
  document.getElementById("getWeather").innerText = "Getting your location...";
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          // Reverse geocoding to get city and state
          const geoRes = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`
          );
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            const city = geoData[0].name;
            const state = geoData[0].state ? ", " + geoData[0].state : "";
            const locationInput = document.getElementById("locationInput");
            locationInput.value = city + state;
            document.getElementById(
              "getWeather"
            ).innerText = `Location found: ${city}${state}. Click 'Get Weather' to see the weather.`;
          } else {
            document.getElementById("getWeather").innerText =
              "Could not determine your city from your location.";
          }
        } catch (error) {
          document.getElementById(
            "getWeather"
          ).innerText = `Error getting city from location: ${error.message}`;
        }
      },
      () => {
        document.getElementById("getWeather").innerText =
          "Unable to get your location.";
      }
    );
  } else {
    document.getElementById("getWeather").innerText =
      "Geolocation is not supported by your browser.";
  }
});

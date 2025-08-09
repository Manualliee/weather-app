import { fetchWeatherByCoords, fetchHourlyWeather } from "./weatherApi.js";
// Get user's current location's weather data. (latitude, longitude)
// Get hourly weather data too
const currentLocation = document.getElementById("currentLocation");
const currentTemp = document.getElementById("currentTemp");
const currentCondition = document.getElementById("currentCondition");
const lowestTemp = document.getElementById("lowestTemp");
const highestTemp = document.getElementById("highestTemp");

function roundTemp(temp) {
  return Math.round(temp);
}

// Fetch and display current weather data
function fetchAndDisplayCurrentWeather(latitude, longitude) {
  fetchWeatherByCoords(latitude, longitude, "imperial")
    .then((data) => {
      currentLocation.innerHTML = `${data.location.name}, ${data.location.region}`;
      currentTemp.innerHTML = `${roundTemp(data.current.temp_f)}°F`;
      currentCondition.innerHTML = data.current.condition.text;
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
    });
}

// Get all hourly forecasts from the fetched data
// This function extracts hourly forecasts from the 3-day forecast data
// WeatherApi free trial only allows 3 day forecast
function getAllHourlyForecasts(data) {
  const day1 = data.forecast.forecastday[0]?.hour || [];
  const day2 = data.forecast.forecastday[1]?.hour || [];
  const day3 = data.forecast.forecastday[2]?.hour || [];
  lowestTemp.innerHTML = `${roundTemp(
    data.forecast.forecastday[0].day.mintemp_f
  )}°F`;
  highestTemp.innerHTML = `${roundTemp(
    data.forecast.forecastday[0].day.maxtemp_f
  )}°F`;
  return day1.concat(day2, day3);
}

function getNextHours(allHours, currentHour) {
  const currentHourIndex = allHours.findIndex((element) => {
    const foundHourIndex = parseInt(element.time.split(" ")[1].split(":")[0]);
    return foundHourIndex === currentHour;
  });
  return allHours.slice(currentHourIndex + 1, currentHourIndex + 15);
}

function displayHourlyForecast(nextHours) {
  const forecastContainer = document.getElementById("forecastContainer");
  forecastContainer.innerHTML = ""; // Clear previous content
  const ulElement = document.createElement("ul");
  // Enable horizontal scrolling
  ulElement.addEventListener("wheel", function (e) {
    if (e.deltaY !== 0) {
      e.preventDefault();
      ulElement.scrollLeft += e.deltaY;
    }
  });
  nextHours.forEach((element) => {
    const iconElement = document.createElement("img");
    iconElement.src = element.condition.icon;
    iconElement.alt = `${element.condition.text} icon`;
    const rawHour = parseInt(element.time.split(" ")[1].split(":")[0]);
    let displayHour = rawHour % 12 || 12;
    let ampm = rawHour < 12 ? "AM" : "PM";
    const listItem = document.createElement("li");
    listItem.innerHTML = `${displayHour} ${ampm} ${
      iconElement.outerHTML
    } ${roundTemp(element.temp_f)}°F`;
    ulElement.appendChild(listItem);
  });
  forecastContainer.appendChild(ulElement);
}

function handleGeolocationSuccess(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  fetchAndDisplayCurrentWeather(latitude, longitude);
  fetchHourlyWeather(latitude, longitude, "imperial")
    .then((data) => {
      const currentHour = parseInt(
        data.current.last_updated.split(" ")[1].split(":")[0]
      );
      const allHours = getAllHourlyForecasts(data);
      const nextNextHours = getNextHours(allHours, currentHour);
      displayHourlyForecast(nextNextHours);
    })
    .catch((error) => {
      console.error("Error fetching hourly weather data:", error);
    });
}

if (!navigator.geolocation) {
  console.error("Geolocation is not supported by this browser.");
} else {
  navigator.geolocation.getCurrentPosition(handleGeolocationSuccess);
}

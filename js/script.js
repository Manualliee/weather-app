import { roundTemp } from "./utils.js";
import { getAllHourlyForecasts, getNextHours } from "./dataHelpers.js";
import {
  fetchWeatherByCoords,
  fetchHourlyWeather,
  fetchYesterdayWeather,
} from "./weatherApi.js";

// DOM elements
const currentLocation = document.getElementById("currentLocation");
const currentTemp = document.getElementById("currentTemp");
const currentCondition = document.getElementById("currentCondition");
const feelsLikeTemp = document.getElementById("feelsLikeTemp");

function fetchAndDisplayCurrentWeather(latitude, longitude) {
  fetchWeatherByCoords(latitude, longitude, "imperial")
    .then((data) => {
      currentLocation.innerHTML = `${data.location.name}, ${data.location.region}`;
      currentTemp.innerHTML = `${roundTemp(data.current.temp_f)}°`;
      currentCondition.innerHTML = data.current.condition.text;
      feelsLikeTemp.innerHTML = `${roundTemp(data.current.feelslike_f)}°`;
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
    });
}

function displayHourlyForecast(nextHours) {
  const forecastContainer = document.getElementById("forecastContainer");
  forecastContainer.innerHTML = "";
  const ulElement = document.createElement("ul");
  ulElement.addEventListener("wheel", function (e) {
    if (e.deltaY !== 0) {
      e.preventDefault();
      ulElement.scrollLeft += e.deltaY;
    }
  });
  nextHours.forEach((element) => {
    const iconElement = document.createElement("img");
    const hourlyPrecipitation = document.createElement("span");
    const snowFlakeIcon = document.createElement("img");
    const rainDropIcon = document.createElement("img");

    if (
      element.chance_of_rain > element.chance_of_snow &&
      element.chance_of_rain > 0
    ) {
      rainDropIcon.src = "assets/water-drop-svgrepo-com.svg";
      rainDropIcon.alt = "Rain icon";
      hourlyPrecipitation.innerHTML = `${rainDropIcon.outerHTML} ${element.chance_of_rain}%`;
    } else if (
      element.chance_of_snow > element.chance_of_rain &&
      element.chance_of_snow > 0
    ) {
      snowFlakeIcon.src = "assets/snow-svgrepo-com.svg";
      snowFlakeIcon.alt = "Snow icon";
      hourlyPrecipitation.innerHTML = `${snowFlakeIcon.outerHTML} ${element.chance_of_snow}%`;
    } else if (
      element.chance_of_rain === element.chance_of_snow &&
      element.chance_of_rain > 0
    ) {
      rainDropIcon.src = "assets/water-drop-svgrepo-com.svg";
      rainDropIcon.alt = "Rain icon";
      hourlyPrecipitation.innerHTML = `${rainDropIcon.outerHTML} ${element.chance_of_rain}%`;
    } else {
      hourlyPrecipitation.innerHTML = `Clear`;
    }

    iconElement.src = element.condition.icon;
    iconElement.alt = `${element.condition.text} icon`;
    const rawHour = parseInt(element.time.split(" ")[1].split(":")[0]);
    let displayHour = rawHour % 12 || 12;
    let ampm = rawHour < 12 ? "AM" : "PM";
    const listItem = document.createElement("li");
    listItem.innerHTML = `${displayHour} ${ampm} ${
      iconElement.outerHTML
    } ${roundTemp(element.temp_f)}° ${hourlyPrecipitation.outerHTML}`;
    ulElement.appendChild(listItem);
  });
  forecastContainer.appendChild(ulElement);
}

function handleGeolocationSuccess(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  fetchAndDisplayCurrentWeather(latitude, longitude);

  fetchYesterdayWeather(latitude, longitude, "imperial")
    .then((data) => {
      const yesterdayDay = data.forecast.forecastday[0].day;
      const highest = yesterdayDay.maxtemp_f;
      const lowest = yesterdayDay.mintemp_f;
      document.getElementById(
        "yesterdayHighestTemp"
      ).textContent = `${roundTemp(highest)}°`;
      document.getElementById(
        "yesterdayLowestTemp"
      ).textContent = `${roundTemp(lowest)}°`;
    })

    .catch((error) => {
      console.error("Error fetching yesterday's weather data:", error);
    });

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

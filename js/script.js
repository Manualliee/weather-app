import { removeLeadingZero } from "./utils.js";
import {
  getAllDaysHours,
  getUvDescription,
  getHumidityDescription,
  getDewPointDescription,
  getCondensedAlertDescription,
} from "./dataHelpers.js";
import {
  fetchWeatherByCoords,
  fetchHourlyWeather,
  fetchYesterdayWeather,
} from "./weatherApi.js";

const currentLocation = document.getElementById("currentLocation");
const currentTemp = document.getElementById("currentTemp");
const currentCondition = document.getElementById("currentCondition");
const feelsLikeTemp = document.getElementById("feelsLikeTemp");
const uvDescription = document.getElementById("uvDescription");
const uvBarIndicator = document.getElementById("uvBarIndicator");
const humidity = document.getElementById("humidity");
const humidityDescription = document.getElementById("humidityDescription");
const humidityBarFill = document.getElementById("humidityBarFill");
const windSpeed = document.getElementById("windSpeed");
const windCompassArrow = document.getElementById("windCompassArrow");
const dewPoint = document.getElementById("dewPoint");
const dewPointDescription = document.getElementById("dewPointDescription");
const visibility = document.getElementById("visibility");

function updateWeatherUI(latitude, longitude) {
  fetchAndDisplayCurrentWeather(latitude, longitude);

  fetchYesterdayWeather(latitude, longitude, "imperial")
    .then((data) => {
      //Only saves current locations data
      if (!lat && !lon) {
        // Save only if this is the user's real current location
        const currentLocationData = {
          lat: data.location.lat,
          lon: data.location.lon,
          name: data.location.name,
          region: data.location.region,
          country: data.location.country,
        };
        localStorage.setItem(
          "currentLocationData",
          JSON.stringify(currentLocationData)
        );
      }

      const yesterdayDay = data.forecast.forecastday[0].day;
      const highest = yesterdayDay.maxtemp_f;
      const lowest = yesterdayDay.mintemp_f;
      document.getElementById(
        "yesterdayHighestTemp"
      ).textContent = `${Math.round(highest)}°`;
      document.getElementById(
        "yesterdayLowestTemp"
      ).textContent = `${Math.round(lowest)}°`;
    })
    .catch((error) => {
      console.error("Error fetching yesterday's weather data:", error);
    });

  fetchHourlyWeather(latitude, longitude, "imperial")
    .then((data) => {
      const alertsContainer = document.getElementById("alertsContainer");
      alertsContainer.innerHTML = ""; // Clear previous alerts

      if (data.alerts && data.alerts.alert && data.alerts.alert.length > 0) {
        const alerts = data.alerts.alert;
        // Show the first alert by default
        const firstAlert = alerts[0];
        const firstAlertDiv = document.createElement("div");
        firstAlertDiv.classList.add("weather-alert");
        firstAlertDiv.innerHTML = `
          <h4>${firstAlert.headline}</h4>
          <p><strong>From:</strong> ${firstAlert.effective}<br>
            <strong>To:</strong> ${firstAlert.expires}</p>
          <p>${getCondensedAlertDescription(firstAlert.desc)}</p>
        `;
        alertsContainer.appendChild(firstAlertDiv);

        // If more than one alert, add dropdown
        if (alerts.length > 1) {
          const dropdownBtn = document.createElement("button");
          dropdownBtn.textContent = `Show ${alerts.length - 1} more alert(s) ▼`;
          dropdownBtn.style.margin = "10px 0";
          dropdownBtn.style.cursor = "pointer";

          const dropdownDiv = document.createElement("div");
          dropdownDiv.style.display = "none";

          for (let i = 1; i < alerts.length; i++) {
            const alert = alerts[i];
            const alertDiv = document.createElement("div");
            alertDiv.classList.add("weather-alert", "dropdown-alert");
            alertDiv.innerHTML = `
              <h4>${alert.headline}</h4>
              <p><strong>From:</strong> ${alert.effective}<br>
                <strong>To:</strong> ${alert.expires}</p>
              <p>${getCondensedAlertDescription(alert.desc)}</p>
            `;
            dropdownDiv.appendChild(alertDiv);
          }

          dropdownBtn.addEventListener("click", () => {
            dropdownDiv.style.display =
              dropdownDiv.style.display === "none" ? "block" : "none";
            dropdownBtn.textContent =
              dropdownDiv.style.display === "none"
                ? `Show ${alerts.length - 1} more alert(s) ▼`
                : `Hide additional alert(s) ▲`;
          });

          alertsContainer.appendChild(dropdownBtn);
          alertsContainer.appendChild(dropdownDiv);
        }
      }

      const { allHours, sunTimes } = getAllDaysHours(data);

      document.getElementById("highestTemp").innerHTML = `${Math.round(
        data.forecast.forecastday[0].day.maxtemp_f
      )}°`;
      document.getElementById("lowestTemp").innerHTML = `${Math.round(
        data.forecast.forecastday[0].day.mintemp_f
      )}°`;

      const currentHour = parseInt(
        data.current.last_updated.split(" ")[1].split(":")[0]
      );
      const nextHourIndex = allHours.findIndex((hourObj) => {
        const hour = parseInt(hourObj.time.split(" ")[1].split(":")[0]);
        return hour > currentHour;
      });

      const displayHours =
        nextHourIndex !== -1
          ? allHours.slice(nextHourIndex, nextHourIndex + 24)
          : allHours.slice(0, 24);
      displayHourlyForecast(displayHours, sunTimes);
    })
    .catch((error) => {
      console.error("Error fetching hourly weather data:", error);
    });
}

// For user's selected searched location
const urlParams = new URLSearchParams(window.location.search);
const lat = urlParams.get("lat");
const lon = urlParams.get("lon");

if (lat && lon) {
  updateWeatherUI(lat, lon);
} else if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(handleGeolocationSuccess);
} else {
  console.error("Geolocation is not supported by this browser.");
}

function fetchAndDisplayCurrentWeather(latitude, longitude) {
  fetchWeatherByCoords(latitude, longitude, "imperial")
    .then((data) => {
      currentLocation.innerHTML = `${data.location.name}, ${data.location.region}`;

      currentTemp.innerHTML = `${Math.round(data.current.temp_f)}°`;

      currentCondition.innerHTML = data.current.condition.text;

      feelsLikeTemp.innerHTML = `${Math.round(data.current.feelslike_f)}°`;

      uvDescription.innerHTML = getUvDescription(data.current.uv);
      // Clamp UV value between 0 and 12 for bar scaling
      const uvMax = 12;
      const uvValue = Math.round(data.current.uv);
      const uvPercent = Math.min(uvValue / uvMax, 1) * 100;

      // Move the indicator
      uvBarIndicator.style.left = `calc(${uvPercent}% )`;
      uvBarIndicator.textContent = uvValue;

      humidity.innerHTML = `${data.current.humidity}%`;
      humidityDescription.innerHTML = getHumidityDescription(
        data.current.humidity
      );
      humidityBarFill.style.width = data.current.humidity + "%";

      windSpeed.innerHTML = `${data.current.wind_mph} mph`;
      windCompassArrow.style.transform = `translate(-50%, -50%) rotate(${data.current.wind_degree}deg)`;

      dewPoint.innerHTML = `${Math.round(data.current.dewpoint_f)}°`;
      dewPointDescription.innerHTML = getDewPointDescription(
        data.current.dewpoint_f
      );

      const pressureValue = data.current.pressure_in;
      const minPressure = 28.0;
      const maxPressure = 31.0;
      const percent = Math.max(
        0,
        Math.min(1, (pressureValue - minPressure) / (maxPressure - minPressure))
      );

      // 3/4 of a circle: arc length is about 235 (for this SVG)
      const arcLength = 235;
      const offset = arcLength * (1 - percent);

      document.getElementById("pressureArc").style.strokeDashoffset = offset;
      document.getElementById("pressureGaugeLabel").textContent =
        pressureValue.toFixed(2) + " in";

      visibility.innerHTML = `${data.current.vis_miles} mi`;
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
    });
}

function displayHourlyForecast(nextHours, sunTimes) {
  const forecastContainer = document.getElementById("forecastContainer");
  forecastContainer.innerHTML = "";
  const ulElement = document.createElement("ul");

  ulElement.addEventListener("wheel", function (e) {
    if (e.deltaY !== 0) {
      e.preventDefault();
      ulElement.scrollLeft += e.deltaY;
    }
  });

  nextHours.forEach((element, idx) => {
    const sunRiseIcon = document.createElement("img");
    const sunSetIcon = document.createElement("img");
    const iconElement = document.createElement("img");
    const hourlyPrecipitation = document.createElement("span");

    sunRiseIcon.src = "assets/sunrise-svgrepo-com.svg";
    sunRiseIcon.alt = "Sunrise icon";
    sunSetIcon.src = "assets/sunset-svgrepo-com.svg";
    sunSetIcon.alt = "Sunset icon";
    iconElement.src = element.condition.icon;
    iconElement.alt = `${element.condition.text} icon`;

    const rawHour = parseInt(element.time.split(" ")[1].split(":")[0]);
    setWeatherBackground(rawHour);
    // Set the weather background
    function setWeatherBackground(hour) {
      const body = document.body;
      body.className = ""; // Remove previous weather class

      if (hour >= 5 && hour < 12) {
        body.classList.add("morning");
      } else if (hour >= 12 && hour < 17) {
        body.classList.add("afternoon");
      } else if (hour >= 17 && hour < 21) {
        body.classList.add("evening");
      } else {
        body.classList.add("night");
      }
    }

    let displayHour = rawHour % 12 || 12;
    let ampm = rawHour < 12 ? "AM" : "PM";

    // Find which day this hour belongs to
    const dayIndex = Math.floor(idx / 24);
    const sunrise = removeLeadingZero(sunTimes[dayIndex].sunrise); // e.g., 6:13 AM
    const sunset = removeLeadingZero(sunTimes[dayIndex].sunset); // e.g., 7:43 PM
    const rawSunrise = parseInt(sunrise.split(" ")[0]); // e.g., 6
    const rawSunset = parseInt(sunset.split(" ")[0]); // e.g., 7

    const listItem = document.createElement("li");
    listItem.innerHTML = `${displayHour} ${ampm} ${
      iconElement.outerHTML
    } ${Math.round(element.temp_f)}° ${hourlyPrecipitation.outerHTML}`;
    ulElement.appendChild(listItem);

    if (
      displayHour === rawSunrise &&
      ampm === "AM" &&
      sunrise.split(" ")[1] === "AM"
    ) {
      const sunriseItem = document.createElement("li");
      sunriseItem.innerHTML = `${sunRiseIcon.outerHTML} Sunrise ${sunrise}`;
      ulElement.appendChild(sunriseItem);
    }
    if (
      displayHour === rawSunset &&
      ampm === "PM" &&
      sunset.split(" ")[1] === "PM"
    ) {
      const sunsetItem = document.createElement("li");
      sunsetItem.innerHTML = `${sunSetIcon.outerHTML} Sunset ${sunset}`;
      ulElement.appendChild(sunsetItem);
    }
  });
  forecastContainer.appendChild(ulElement);
}

function handleGeolocationSuccess(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  updateWeatherUI(latitude, longitude);
}

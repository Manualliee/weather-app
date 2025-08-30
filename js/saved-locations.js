import { fetchHourlyWeather } from "./weatherApi.js";
import { getDayOfWeek, formatMonthDay } from "./dataHelpers.js";

document.addEventListener("DOMContentLoaded", async () => {
  const savedLocationsList = document.getElementById("savedLocationsList");
  const currentLocation = JSON.parse(
    localStorage.getItem("currentLocationData") || "null"
  );
  const savedLocations =
    JSON.parse(localStorage.getItem("savedLocations")) || [];

  // --- Current Location ---
  if (currentLocation) {
    const currentLocationLi = document.createElement("li");
    const infoDiv = document.createElement("div");
    infoDiv.className = "location-info";
    const weatherDiv = document.createElement("div");
    weatherDiv.className = "weather-info";

    try {
      const weather = await fetchHourlyWeather(
        currentLocation.lat,
        currentLocation.lon,
        "imperial"
      );
      const conditionText = weather.current.condition.text.toLowerCase();
      const isCloudy =
        conditionText === "cloudy" ||
        conditionText === "overcast" ||
        conditionText === "mostly cloudy" ||
        conditionText === "light rain" ||
        conditionText === "drizzle" ||
        conditionText === "rain";

      if (isCloudy) {
        currentLocationLi.classList.add("cloudy");
      } else {
        currentLocationLi.classList.remove("cloudy");
      }

      const currentTemp = Math.round(weather.current.temp_f);
      const currentTempSpan = document.createElement("span");
      currentTempSpan.className = "current-temp";
      currentTempSpan.textContent = `${currentTemp}°`;

      // Weather icon
      const iconImg = document.createElement("img");
      iconImg.src = weather.current.condition.icon;
      iconImg.alt = weather.current.condition.text;

      const currentIconTempDiv = document.createElement("div");
      currentIconTempDiv;
      currentIconTempDiv.className = "current-icon-temp";
      currentIconTempDiv.appendChild(iconImg);
      currentIconTempDiv.appendChild(currentTempSpan);

      // High/Low temp
      const high = weather.forecast.forecastday[0].day.maxtemp_f;
      const low = weather.forecast.forecastday[0].day.mintemp_f;
      const tempSpan = document.createElement("span");
      tempSpan.className = "high-low-temp";
      tempSpan.textContent = ` ${Math.round(high)}° / ${Math.round(low)}°`;

      // Current time
      let locationTime = weather.location.localtime.split(" "); // ["YYYY-MM-DD", "HH:MM"]
      let [hourStr, minuteStr] = locationTime[1].split(":"); // ["HH", "MM"]
      let hour = parseInt(hourStr, 10);
      let ampm = hour >= 12 ? "PM" : "AM";
      let hour12 = hour % 12 || 12;

      // Remove any previous time-of-day classes from currentLocationLi
      currentLocationLi.classList.remove(
        "morning",
        "afternoon",
        "evening",
        "night"
      );

      let timeOfDayClass = "";
      if (hour >= 5 && hour < 12) {
        timeOfDayClass = "morning";
      } else if (hour >= 12 && hour < 17) {
        timeOfDayClass = "afternoon";
      } else if (hour >= 17 && hour < 20) {
        timeOfDayClass = "evening";
      } else {
        timeOfDayClass = "night";
      }
      currentLocationLi.classList.add(timeOfDayClass);

      // --- Build infoDiv ---
      const nameH3 = document.createElement("h3");
      nameH3.textContent = currentLocation.name;

      const regionCountrySpan = document.createElement("span");
      regionCountrySpan.textContent = `${currentLocation.region}, ${currentLocation.country}`;
      regionCountrySpan.className = "region-country";

      const dateTimeSpan = document.createElement("span");
      dateTimeSpan.textContent = `${getDayOfWeek(
        locationTime[0]
      )}, ${formatMonthDay(locationTime[0])} at ${hour12}:${minuteStr} ${ampm}`;
      dateTimeSpan.className = "date-time";

      infoDiv.appendChild(nameH3);
      infoDiv.appendChild(regionCountrySpan);
      infoDiv.appendChild(document.createElement("br"));
      infoDiv.appendChild(dateTimeSpan);

      // --- Build weatherDiv ---
      weatherDiv.appendChild(currentIconTempDiv);
      weatherDiv.appendChild(tempSpan);

      currentLocationLi.appendChild(infoDiv);
      currentLocationLi.appendChild(weatherDiv);
    } catch (err) {
      currentLocationLi.textContent = `${currentLocation.name}, ${currentLocation.region}, ${currentLocation.country} (Weather unavailable)`;
    }
    currentLocationLi.addEventListener("click", () => {
      window.location.href = `index.html?lat=${currentLocation.lat}&lon=${currentLocation.lon}`;
    });
    savedLocationsList.appendChild(currentLocationLi);
  }

  // --- Saved Locations ---
  if (savedLocations.length > 0) {
    savedLocations.forEach(async (location, index) => {
      const locationLi = document.createElement("li");
      const infoDiv = document.createElement("div");
      infoDiv.className = "location-info";
      const weatherDiv = document.createElement("div");
      weatherDiv.className = "weather-info";

      try {
        const weather = await fetchHourlyWeather(
          location.lat,
          location.lon,
          "imperial"
        );

        const conditionText = weather.current.condition.text.toLowerCase();
        const isCloudy =
          conditionText === "cloudy" ||
          conditionText === "overcast" ||
          conditionText === "mostly cloudy" ||
          conditionText === "light rain" ||
          conditionText === "drizzle" ||
          conditionText === "rain";

        if (isCloudy) {
          locationLi.classList.add("cloudy");
        } else {
          locationLi.classList.remove("cloudy");
        }

        const currentTemp = Math.round(weather.current.temp_f);
        const currentTempSpan = document.createElement("span");
        currentTempSpan.className = "current-temp";
        currentTempSpan.textContent = `${currentTemp}°`;

        // Weather icon
        const iconImg = document.createElement("img");
        iconImg.src = weather.current.condition.icon;
        iconImg.alt = weather.current.condition.text;

        const currentIconTempDiv = document.createElement("div");
        currentIconTempDiv.className = "current-icon-temp";
        currentIconTempDiv.appendChild(iconImg);
        currentIconTempDiv.appendChild(currentTempSpan);

        // High/Low temp
        const high = weather.forecast.forecastday[0].day.maxtemp_f;
        const low = weather.forecast.forecastday[0].day.mintemp_f;
        const tempSpan = document.createElement("span");
        tempSpan.className = "high-low-temp";
        tempSpan.textContent = ` ${Math.round(high)}° / ${Math.round(low)}°`;

        // Current time
        let locationTime = weather.location.localtime.split(" "); // ["YYYY-MM-DD", "HH:MM"]
        let [hourStr, minuteStr] = locationTime[1].split(":"); // ["HH", "MM"]
        let hour = parseInt(hourStr, 10);
        let ampm = hour >= 12 ? "PM" : "AM";
        let hour12 = hour % 12 || 12;

        locationLi.classList.remove("morning", "afternoon", "evening", "night");
        let timeOfDayClass = "";
        if (hour >= 5 && hour < 12) {
          timeOfDayClass = "morning";
        } else if (hour >= 12 && hour < 17) {
          timeOfDayClass = "afternoon";
        } else if (hour >= 17 && hour < 20) {
          timeOfDayClass = "evening";
        } else {
          timeOfDayClass = "night";
        }
        locationLi.classList.add(timeOfDayClass);

        // --- Build infoDiv ---
        const nameH3 = document.createElement("h3");
        nameH3.textContent = location.name;

        const regionCountrySpan = document.createElement("span");
        regionCountrySpan.textContent = `${location.region}, ${location.country}`;
        regionCountrySpan.className = "region-country";

        const dateTimeSpan = document.createElement("span");
        dateTimeSpan.textContent = `${getDayOfWeek(
          locationTime[0]
        )}, ${formatMonthDay(
          locationTime[0]
        )} at ${hour12}:${minuteStr} ${ampm}`;
        dateTimeSpan.className = "date-time";

        infoDiv.appendChild(nameH3);
        infoDiv.appendChild(regionCountrySpan);
        infoDiv.appendChild(document.createElement("br"));
        infoDiv.appendChild(dateTimeSpan);

        // --- Build weatherDiv ---
        weatherDiv.appendChild(currentIconTempDiv);
        weatherDiv.appendChild(tempSpan);

        locationLi.appendChild(infoDiv);
        locationLi.appendChild(weatherDiv);
      } catch (err) {
        locationLi.textContent = `${location.name}, ${location.region}, ${location.country} (Weather unavailable)`;
      }

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "x";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        let savedLocations =
          JSON.parse(localStorage.getItem("savedLocations")) || [];
        savedLocations.splice(index, 1);
        localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
        locationLi.remove();
      });
      locationLi.appendChild(deleteBtn);

      // Click to go to main UI
      locationLi.addEventListener("click", () => {
        window.location.href = `index.html?lat=${location.lat}&lon=${location.lon}`;
      });

      savedLocationsList.appendChild(locationLi);
    });
  }
});

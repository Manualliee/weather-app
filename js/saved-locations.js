import { fetchHourlyWeather } from "./weatherApi.js";
import { getDayOfWeek, formatMonthDay } from "./dataHelpers.js";

document.addEventListener("DOMContentLoaded", async () => {
  const savedLocationsList = document.getElementById("savedLocationsList");

  // Only check for isCurrent property, not coordinates
  function isCurrentLocationSaved() {
    const savedLocations =
      JSON.parse(localStorage.getItem("savedLocations")) || [];
    return savedLocations.some((loc) => loc.isCurrent);
  }

  function renderAddCurrentLocationBtn() {
    const existingBtn = document.getElementById("add-current-location-btn");
    if (existingBtn) return; // Don't add twice

    const addBtn = document.createElement("button");
    addBtn.id = "add-current-location-btn";
    addBtn.textContent = "Add current location";
    addBtn.style.marginBottom = "1em";
    addBtn.addEventListener("click", async () => {
      if (
        confirm(
          "Do you want to use your device's precise location to provide weather services?"
        )
      ) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              // Fetch weather data to get location details
              const weather = await fetchHourlyWeather(lat, lon, "imperial");
              const mapLocationToSave = {
                name: weather.location.name,
                region: weather.location.region,
                country: weather.location.country,
                lat: weather.location.lat,
                lon: weather.location.lon,
                isCurrent: true, // Mark as current location
              };
              let savedLocations =
                JSON.parse(localStorage.getItem("savedLocations")) || [];
              // Remove any existing current location (by isCurrent)
              savedLocations = savedLocations.filter((loc) => !loc.isCurrent);
              // Add to top
              savedLocations.unshift(mapLocationToSave);
              localStorage.setItem(
                "savedLocations",
                JSON.stringify(savedLocations)
              );
              // Remove the button from the DOM
              const btn = document.getElementById("add-current-location-btn");
              if (btn) btn.remove();
              await renderSavedLocations();
              await checkAndRenderAddCurrentLocationBtn();
            },
            (error) => {
              alert("Unable to get your location.\n" + (error && error.message ? error.message : ""));
            }
          );
        } else {
          alert("Geolocation is not supported by your browser.");
        }
      }
    });
    savedLocationsList.parentNode.insertBefore(addBtn, savedLocationsList);
  }

  async function checkAndRenderAddCurrentLocationBtn() {
    if (!isCurrentLocationSaved()) {
      renderAddCurrentLocationBtn();
    } else {
      const btn = document.getElementById("add-current-location-btn");
      if (btn) btn.remove();
    }
  }

  async function renderSavedLocations() {
    savedLocationsList.innerHTML = "";
    let savedLocations =
      JSON.parse(localStorage.getItem("savedLocations")) || [];
    for (let [index, location] of savedLocations.entries()) {
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
          conditionText === "rain" ||
          conditionText === "thunderstorm" ||
          conditionText === "moderate rain" ||
          conditionText === "moderate or heavy rain shower";

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

        // Badge for current location
        if (location.isCurrent) {
          const badge = document.createElement("span");
          badge.textContent = "Current Location";
          badge.className = "current-location-badge";
          infoDiv.appendChild(document.createElement("br"));
          infoDiv.appendChild(badge);
        }

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
      deleteBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        let savedLocations =
          JSON.parse(localStorage.getItem("savedLocations")) || [];
        savedLocations.splice(index, 1);
        localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
        locationLi.remove();
        await renderSavedLocations();
        await checkAndRenderAddCurrentLocationBtn();
      });
      locationLi.appendChild(deleteBtn);

      // Click to go to main UI
      locationLi.addEventListener("click", () => {
        window.location.href = `index.html?lat=${location.lat}&lon=${location.lon}`;
      });

      savedLocationsList.appendChild(locationLi);
    }
  }

  await renderSavedLocations();
  await checkAndRenderAddCurrentLocationBtn();
});

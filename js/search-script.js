import { fetchCitySuggestions, fetchWeatherByCoords } from "./weatherApi.js";
import { getDayOfWeek, formatMonthDay } from "./dataHelpers.js";

// Search for city weather
document.getElementById("searchInput").addEventListener("input", function (e) {
  const city = e.target.value.trim();
  if (!city) {
    document.getElementById("suggestionsContainer").innerHTML = "";
    document.getElementById("suggestionsContainer").style.display = "none";
    return;
  }

  fetchCitySuggestions(city)
    .then((data) => {
      const suggestionsContainer = document.getElementById(
        "suggestionsContainer"
      );
      suggestionsContainer.innerHTML = ""; // Clear previous results
      if (data.length === 0) {
        suggestionsContainer.style.display = "none";
        return;
      }
      suggestionsContainer.style.display = "flex";

      data.forEach((location) => {
        const suggestionItem = document.createElement("div");
        const suggestionItemName = document.createElement("span");
        const suggestionItemRegionCountry = document.createElement("span");
        suggestionItem.classList.add("suggestion");
        suggestionItemName.classList.add("suggestion-name");
        suggestionItemRegionCountry.classList.add("suggestion-region-country");

        suggestionItemName.textContent = location.name;
        suggestionItemRegionCountry.textContent = `${location.region}, ${location.country}`;
        suggestionItem.dataset.lat = location.lat;
        suggestionItem.dataset.lon = location.lon;

        suggestionItem.appendChild(suggestionItemName);
        suggestionItem.appendChild(suggestionItemRegionCountry);
        suggestionsContainer.appendChild(suggestionItem);

        suggestionItem.addEventListener("click", function () {
          const lat = parseFloat(this.dataset.lat);
          const lon = parseFloat(this.dataset.lon);
          map.setView([lat, lon], 12);
          suggestionsContainer.innerHTML = "";
          suggestionsContainer.style.display = "none";

          fetchWeatherByCoords(lat, lon, "imperial")
            .then((data) => {
              let savedLocations =
                JSON.parse(localStorage.getItem("savedLocations")) || [];
              const alreadySaved = savedLocations.some(
                (loc) =>
                  Number(loc.lat).toFixed(4) === Number(data.location.lat).toFixed(4) &&
                  Number(loc.lon).toFixed(4) === Number(data.location.lon).toFixed(4)
              );

              let localTime = data.location.localtime.split(" ");
              let [hourStr, minuteStr] = localTime[1].split(":"); // ["HH", "MM"]
              let hour = parseInt(hourStr, 10);
              let ampm = hour >= 12 ? "PM" : "AM";
              let hour12 = hour % 12 || 12;

              const popupContent = `
                <div class="weather-popup-card">
                  <div class="location-weather">
                    <div class="popup-location-title">
                      <span class="popup-location-name">${
                        data.location.name
                      }</span>
                      <span class="popup-location-region-country">${
                        data.location.region
                      }, ${data.location.country}</span>
                      <span class="popup-location-date">
                        ${getDayOfWeek(localTime[0])}, ${formatMonthDay(
                localTime[0]
              )} at ${hour12}:${minuteStr} ${ampm}
                      </span>
                    </div>
                    <div class="popup-location-weather">
                      <div class="popup-location-icon-temp">
                        <img src="${data.current.condition.icon}" alt="${
                data.current.condition.text
              }" />
                            <span class="popup-temp">${Math.round(
                              data.current.temp_f
                            )}°F</span>
                      </div>
                      <span class="popup-condition">${
                        data.current.condition.text
                      }</span>
                    </div>
                  </div>
                  <div class="popup-links">
                    <a href="index.html?lat=${lat}&lon=${lon}">Details</a>
                    ${
                      alreadySaved
                        ? ` `
                        : `<a href="saved-locations.html" id="add-location-link">Add</a>`
                    }
                  </div>
                </div>
              `;

              L.popup()
                .setLatLng([lat, lon])
                .setContent(popupContent)
                .openOn(map);

              setTimeout(() => {
                const addLink = document.getElementById("add-location-link");
                if (addLink) {
                  addLink.addEventListener("click", function (e) {
                    e.preventDefault();

                    const mapLocationToSave = {
                      name: data.location.name,
                      region: data.location.region,
                      country: data.location.country,
                      lat: data.location.lat,
                      lon: data.location.lon,
                    };

                    let savedLocations =
                      JSON.parse(localStorage.getItem("savedLocations")) || [];
                    if (
                      !savedLocations.some(
                        (loc) =>
                          Number(loc.lat).toFixed(4) === Number(mapLocationToSave.lat).toFixed(4) &&
                          Number(loc.lon).toFixed(4) === Number(mapLocationToSave.lon).toFixed(4)
                      )
                    ) {
                      savedLocations.push(mapLocationToSave);
                      localStorage.setItem(
                        "savedLocations",
                        JSON.stringify(savedLocations)
                      );
                    }
                    window.location.href = "saved-locations.html";
                  });
                }
              }, 0);
            })
            .catch((error) => {
              alert("No matching location found for the selected point.");
              console.error("Error fetching weather data:", error);
            });
        });

        suggestionsContainer.appendChild(suggestionItem);
      });
    })
    .catch((error) => {
      console.error("Error fetching city suggestions:", error);
    });
});

// Map initialization
const map = L.map("map", {
  center: [20, 0], // World view
  zoom: 2,
  minZoom: 2,
  maxZoom: 12, // Zoom level
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Validate latitude and longitude
function isValidLatLon(lat, lon) {
  return (
    typeof lat === "number" &&
    typeof lon === "number" &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

map.on("click", function (e) {
  let lat = e.latlng.lat;
  let lon = e.latlng.lng;

  // Normalize longitude to [-180, 180]
  lon = ((((lon + 180) % 360) + 360) % 360) - 180;

  if (!isValidLatLon(lat, lon)) {
    alert("Invalid location selected on the map.");
    return;
  }

  fetchWeatherByCoords(lat, lon, "imperial")
    .then((data) => {
      let localTime = data.location.localtime.split(" ");
      let [hourStr, minuteStr] = localTime[1].split(":"); // ["HH", "MM"]
      let hour = parseInt(hourStr, 10);
      let ampm = hour >= 12 ? "PM" : "AM";
      let hour12 = hour % 12 || 12;

      map.setView([lat, lon], 12); // Set zoom level to city

      let savedLocations =
        JSON.parse(localStorage.getItem("savedLocations")) || [];
      const alreadySaved = savedLocations.some(
        (loc) =>
          Number(loc.lat).toFixed(4) === Number(data.location.lat).toFixed(4) &&
          Number(loc.lon).toFixed(4) === Number(data.location.lon).toFixed(4)
      );
      const popupContent = `
                <div class="weather-popup-card">
                  <div class="location-weather">
                    <div class="popup-location-title">
                      <span class="popup-location-name">${
                        data.location.name
                      }</span>
                      <span class="popup-location-region-country">${
                        data.location.region
                      }, ${data.location.country}</span>
                      <span class="popup-location-date">
                        ${getDayOfWeek(localTime[0])}, ${formatMonthDay(
        localTime[0]
      )} at ${hour12}:${minuteStr} ${ampm}
                      </span>
                    </div>
                    <div class="popup-location-weather">
                      <div class="popup-location-icon-temp">
                        <img src="${data.current.condition.icon}" alt="${
        data.current.condition.text
      }" />
                            <span class="popup-temp">${Math.round(
                              data.current.temp_f
                            )}°F</span>
                      </div>
                      <span class="popup-condition">${
                        data.current.condition.text
                      }</span>
                    </div>
                  </div>
                  <div class="popup-links">
                    <a href="index.html?lat=${lat}&lon=${lon}">Details</a>
                    ${
                      alreadySaved
                        ? ` `
                        : `<a href="saved-locations.html" id="add-location-link">Add</a>`
                    }
                  </div>
                </div>
              `;
      L.popup().setLatLng([lat, lon]).setContent(popupContent).openOn(map);

      setTimeout(() => {
        const addLink = document.getElementById("add-location-link");
        if (addLink) {
          addLink.addEventListener("click", function (e) {
            e.preventDefault();

            const mapLocationToSave = {
              name: data.location.name,
              region: data.location.region,
              country: data.location.country,
              lat: data.location.lat,
              lon: data.location.lon,
            };

            let savedLocations =
              JSON.parse(localStorage.getItem("savedLocations")) || [];
            if (
              !savedLocations.some(
                (loc) =>
                  Number(loc.lat).toFixed(4) === Number(mapLocationToSave.lat).toFixed(4) &&
                  Number(loc.lon).toFixed(4) === Number(mapLocationToSave.lon).toFixed(4)
              )
            ) {
              savedLocations.push(mapLocationToSave);
              localStorage.setItem(
                "savedLocations",
                JSON.stringify(savedLocations)
              );
            }
            // Redirect after saving
            window.location.href = "saved-locations.html";
          });
        }
      }, 0);
    })
    .catch((error) => {
      alert("No matching location found for the selected point.");
      console.error("Error fetching weather data:", error);
    });
});

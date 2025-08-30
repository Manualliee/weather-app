import { fetchCitySuggestions } from "./weatherApi.js";
import { fetchWeatherByCoords } from "./weatherApi.js";

// Search for city weather
document.getElementById("searchInput").addEventListener("input", function (e) {
  const city = e.target.value.trim();
  if (!city) {
    // If the input is empty, clear the search results
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
              const popupContent = `
                <div class="weather-popup-card">
                  <strong>${data.location.name}, ${data.location.region}, ${
                data.location.country
              }</strong><br>
                  <img src="${data.current.condition.icon}" alt="${
                data.current.condition.text
              }" />
                  <div>
                    <span class="popup-temp">${Math.round(
                      data.current.temp_f
                    )}°F</span>,
                    <span class="popup-condition">${
                      data.current.condition.text
                    }</span>
                  </div>
                  <div class="popup-links">
                    <a href="index.html?lat=${lat}&lon=${lon}">Details</a>
                    <a href="saved-locations.html" id="add-location-link">Add</a>
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
                          loc.lat === mapLocationToSave.lat &&
                          loc.lon === mapLocationToSave.lon
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
      map.setView([lat, lon], 12); // Set zoom level to city
      const popupContent = `
      <strong>${data.location.name}, ${data.location.region}, ${
        data.location.country
      }</strong><br>
      <img src="${data.current.condition.icon}" alt="${
        data.current.condition.text
      }" />
      ${Math.round(data.current.temp_f)}°F, ${data.current.condition.text}
      <a href="index.html?lat=${lat}&lon=${lon}">Details</a>
      <a href="saved-locations.html" id="add-location-link">Add</a>
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
                  loc.lat === mapLocationToSave.lat &&
                  loc.lon === mapLocationToSave.lon
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

import { fetchCitySuggestions } from "./weatherApi.js";
import { fetchWeatherByCoords } from "./weatherApi.js";

// Search for city weather
document.getElementById("searchInput").addEventListener("input", function (e) {
  const city = e.target.value.trim();
  if (!city) {
    // If the input is empty, clear the search results
    document.getElementById("searchResults").innerHTML = "";
    return;
  }
  fetchCitySuggestions(city)
    .then((data) => {
      // Handle the weather data for the searched city
      const searchResults = document.getElementById("searchResults");
      searchResults.innerHTML = ""; // Clear previous results

      data.forEach((suggestion) => {
        const location = document.createElement("li");
        location.textContent = `${suggestion.name}, ${suggestion.region}, ${suggestion.country}`;
        location.addEventListener("click", () => {
          const suggestLat = suggestion.lat;
          const suggestLon = suggestion.lon;
          // Redirect to index.html with lat/lon as URL parameters
          window.location.href = `index.html?lat=${suggestLat}&lon=${suggestLon}`;
        });
        searchResults.appendChild(location);
      });
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
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

map.on("click", function (e) {
  const lat = e.latlng.lat;
  const lon = e.latlng.lng;

  fetchWeatherByCoords(lat, lon, "imperial").then((data) => {
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
  });
});

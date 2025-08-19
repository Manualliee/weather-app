document.addEventListener("DOMContentLoaded", () => {
  const savedLocationsList = document.getElementById("savedLocationsList");
  const currentLocation = JSON.parse(
    localStorage.getItem("currentLocationData") || []
  );
  const savedLocations =
    JSON.parse(localStorage.getItem("savedLocations")) || [];

  if (currentLocation) {
    const currentLocationLi = document.createElement("li");
    currentLocationLi.textContent = `${currentLocation.name}, ${currentLocation.region}, ${currentLocation.country}`;
    currentLocationLi.addEventListener("click", () => {
      // Redirect to main UI with lat/lon as URL params
      window.location.href = `index.html?lat=${currentLocation.lat}&lon=${currentLocation.lon}`;
    });
    savedLocationsList.appendChild(currentLocationLi);
  }

  if (savedLocations.length > 0) {
    savedLocations.forEach((location, index) => {
      const locationLi = document.createElement("li");
      locationLi.textContent = `${location.name}, ${location.region}, ${location.country}`;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent triggering the li click event
        let savedLocations =
          JSON.parse(localStorage.getItem("savedLocations")) || [];
        savedLocations.splice(index, 1);
        localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
        locationLi.remove();
      });

      locationLi.appendChild(deleteBtn);

      locationLi.addEventListener("click", () => {
        // Redirect to main UI with lat/lon as URL params
        window.location.href = `index.html?lat=${location.lat}&lon=${location.lon}`;
      });
      savedLocationsList.appendChild(locationLi);
    });
  }
});

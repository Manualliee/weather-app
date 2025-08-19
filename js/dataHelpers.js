// Helper function to get yesterday's date in YYYY-MM-DD format
export function getYesterdayDate() {
  const today = new Date();
  today.setDate(today.getDate() - 1);
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getDayOfWeek(dateString) {
  // Split the date string and use Date.UTC to avoid timezone offset
  const [year, month, day] = dateString.split("-");
  const date = new Date(Date.UTC(year, month - 1, day));
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getUTCDay()];
}

// Get the all hours from today to the next two day
export function getAllDaysHours(data, numDays = 3) {
  const allHours = [];
  const sunTimes = [];
  for (let i = 0; i < numDays; i++) {
    if (data.forecast.forecastday[i]) {
      allHours.push(...data.forecast.forecastday[i].hour);
      // Get the sunrise and sunset times for each day
      sunTimes.push({
        sunrise: data.forecast.forecastday[i].astro.sunrise,
        sunset: data.forecast.forecastday[i].astro.sunset,
      });
    }
  }

  data.forecast.forecastday.forEach((day, i) => {
    const dayName = getDayOfWeek(day.date); // e.g., "Mon", "Tue", etc.
    const highest = Math.round(day.day.maxtemp_f);
    const lowest = Math.round(day.day.mintemp_f);

    // Set the day label (ie "Mon", "Tue", etc.)
    const labelEl = document.getElementById(`weatherSummaryDay${i}Label`);
    if (labelEl) labelEl.textContent = dayName;

    // Set the high/low temps
    const highEl = document.getElementById(`weatherSummaryHighestTemp${i}`);
    const lowEl = document.getElementById(`weatherSummaryLowestTemp${i}`);
    if (highEl) highEl.textContent = `${highest}°`;
    if (lowEl) lowEl.textContent = `${lowest}°`;
  });
  return { allHours, sunTimes };
}

export function getUvDescription(uv) {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very High";
  return "Extreme";
}

export function getHumidityDescription(humidity) {
  if (humidity < 30) return "Dry";
  if (humidity < 60) return "Comfortable";
  if (humidity < 80) return "Noticeable humidity";
  return "Humid";
}

export function getDewPointDescription(dewPointF) {
  if (dewPointF < 50) return "Comfortable";
  if (dewPointF < 60) return "Noticeable";
  if (dewPointF < 70) return "Sticky";
  return "Oppressive";
}
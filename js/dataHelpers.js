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

export function formatMonthDay(dateStr) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const [, month, day] = dateStr.split("-");
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`;
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
    const dayName = getDayOfWeek(day.date);
    const highest = Math.round(day.day.maxtemp_f);
    const lowest = Math.round(day.day.mintemp_f);

    // Set the day label
    const labelEl = document.getElementById(`weatherSummaryDay${i}Label`);
    if (labelEl) labelEl.textContent = dayName;

    // Set the high/low temps
    const highEl = document.getElementById(`weatherSummaryHighestTemp${i}`);
    const lowEl = document.getElementById(`weatherSummaryLowestTemp${i}`);
    if (highEl) highEl.textContent = `${highest}°`;
    if (lowEl) lowEl.textContent = `${lowest}°`;

    // --- Set the day icon ---
    const dayIconEl = document.getElementById(`weatherSummaryDayIcon${i}`);
    if (dayIconEl) dayIconEl.src = "https:" + day.day.condition.icon;

    // --- Set the night icon (use hour 0 or a late hour as night) ---
    const nightHour =
      day.hour.find((h) => {
        const hour = parseInt(h.time.split(" ")[1].split(":")[0]);
        return hour === 0 || hour === 21 || hour === 22 || hour === 23;
      }) || day.hour[0];
    const nightIconEl = document.getElementById(`weatherSummaryNightIcon${i}`);
    if (nightIconEl && nightHour) nightIconEl.src = "https:" + nightHour.condition.icon;
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
  if (dewPointF < 50) return "Dry and comfortable";
  if (dewPointF < 55) return "Pleasant";
  if (dewPointF < 60) return "A bit humid";
  if (dewPointF < 65) return "Sticky";
  if (dewPointF < 70) return "Very sticky";
  return "Oppressive, muggy";
}

export function getVisibilityDescription(vis_miles) {
  if (vis_miles >= 10) return "Excellent";
  if (vis_miles >= 6) return "Good";
  if (vis_miles >= 3) return "Moderate";
  if (vis_miles >= 1) return "Poor";
  return "Very Poor";
}

export function formatAlertDateTime(dateTimeStr) {
  const dateObj = new Date(dateTimeStr);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayOfWeek = days[dateObj.getDay()];
  const month = months[dateObj.getMonth()];
  const day = dateObj.getDate();

  let hour = dateObj.getHours();
  const minute = dateObj.getMinutes().toString().padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${dayOfWeek}, ${month} ${day} at ${hour}:${minute} ${ampm}`;
}
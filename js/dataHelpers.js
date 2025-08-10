import { roundTemp } from "./utils.js";

const lowestTemp = document.getElementById("lowestTemp");
const highestTemp = document.getElementById("highestTemp");
const todaysWeatherHighestTemp = document.getElementById(
  "todaysWeatherHighestTemp"
);
const todaysWeatherLowestTemp = document.getElementById(
  "todaysWeatherLowestTemp"
);
const tomorrowLowestTemp = document.getElementById("tomorrowLowestTemp");
const tomorrowHighestTemp = document.getElementById("tomorrowHighestTemp");
const dayAfterTomorrowLowestTemp = document.getElementById(
  "dayAfterTomorrowLowestTemp"
);
const dayAfterTomorrowHighestTemp = document.getElementById(
  "dayAfterTomorrowHighestTemp"
);
const tomorrowDayOfWeek = document.getElementById("tomorrowDayOfWeek");
const nextDayOfWeek = document.getElementById(
  "nextDayOfWeek"
);

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
  const [year, month, day] = dateString.split('-');
  const date = new Date(Date.UTC(year, month - 1, day));
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getUTCDay()];
}

// Get all hourly forecasts data
export function getAllHourlyForecasts(data) {
  const day1 = data.forecast.forecastday[0]?.hour || [];
  const day2 = data.forecast.forecastday[1]?.hour || [];
  const day3 = data.forecast.forecastday[2]?.hour || [];

  // Get tomorrow's and the next day's day of the week
  tomorrowDayOfWeek.innerHTML = getDayOfWeek(data.forecast.forecastday[1].date); // "Sun"
  nextDayOfWeek.innerHTML = getDayOfWeek(data.forecast.forecastday[2].date); // "Mon"

  // For current Location's highest/lowest temperature today
  lowestTemp.innerHTML = `${roundTemp(
    data.forecast.forecastday[0].day.mintemp_f
  )}°`;
  highestTemp.innerHTML = `${roundTemp(
    data.forecast.forecastday[0].day.maxtemp_f
  )}°`;

  // For weather summary section
  todaysWeatherHighestTemp.innerHTML = `${roundTemp(
    data.forecast.forecastday[0].day.maxtemp_f
  )}°`;
  todaysWeatherLowestTemp.innerHTML = `${roundTemp(
    data.forecast.forecastday[0].day.mintemp_f
  )}°`;

  tomorrowLowestTemp.innerHTML = `${roundTemp(
    data.forecast.forecastday[1].day.mintemp_f
  )}°`;
  tomorrowHighestTemp.innerHTML = `${roundTemp(
    data.forecast.forecastday[1].day.maxtemp_f
  )}°`;

  dayAfterTomorrowLowestTemp.innerHTML = `${roundTemp(
    data.forecast.forecastday[2].day.mintemp_f
  )}°`;
  dayAfterTomorrowHighestTemp.innerHTML = `${roundTemp(
    data.forecast.forecastday[2].day.maxtemp_f
  )}°`;

  return day1.concat(day2, day3);
}

// Get the next 12 hours of forecast data
export function getNextHours(allHours, currentHour) {
  const currentHourIndex = allHours.findIndex((element) => {
    const foundHourIndex = parseInt(element.time.split(" ")[1].split(":")[0]);
    return foundHourIndex === currentHour;
  });
  return allHours.slice(currentHourIndex + 1, currentHourIndex + 15);
}

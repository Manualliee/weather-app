export function removeLeadingZero(timeStr) {
  const [time, ampm] = timeStr.split(" ");
  let [hour, minute] = time.split(":");
  hour = String(parseInt(hour, 10)); // removes leading zero
  return `${hour}:${minute} ${ampm}`;
}
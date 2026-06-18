export const BUILD_VERSION = __BUILD_VERSION__;
export const BUILD_TIME_DE = new Date(__BUILD_TIME__).toLocaleString("de-DE", {
  timeZone: "Europe/Berlin",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
}) + " Uhr";

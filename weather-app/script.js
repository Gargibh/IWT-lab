// ---------- 1. Grab the HTML elements we need ----------
var form          = document.getElementById("search-form");
var cityInput     = document.getElementById("city-input");
var searchButton  = document.getElementById("search-button");
var messageEl     = document.getElementById("message");
var weatherEl     = document.getElementById("weather");

var locationEl    = document.getElementById("location");
var temperatureEl = document.getElementById("temperature");
var conditionEl   = document.getElementById("condition");
var feelsLikeEl   = document.getElementById("feels-like");
var humidityEl    = document.getElementById("humidity");
var windEl        = document.getElementById("wind");
var precipEl      = document.getElementById("precipitation");
var dayNightEl    = document.getElementById("day-night");

// True while a request is in progress (prevents overlapping requests)
var isLoading = false;

// ---------- 2. WMO weather code -> readable text ----------
var WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
};

function describeWeatherCode(code) {
  // If the code is not in our table, show a safe fallback
  return WEATHER_CODES[code] || "Unknown conditions (code " + code + ")";
}

// ---------- 3. Helper functions for the page ----------

// Show a message. type is "loading", "error", or "" (plain)
function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = "message" + (type ? " " + type : "");
}

// Hide old weather so it can't be mistaken for a new result
function clearWeather() {
  weatherEl.hidden = true;
}

// Turn the loading state on or off (also disables the button)
function setLoading(loading) {
  isLoading = loading;
  searchButton.disabled = loading;
}

// Show an error, clear old data, and re-enable the button
function fail(text) {
  clearWeather();
  showMessage(text, "error");
  setLoading(false);
}

// ---------- 4. A reusable AJAX helper using XMLHttpRequest ----------
// url:       the address to request
// onSuccess: called with the parsed JSON object when everything works
// onFailure: called with an error message string when anything goes wrong
function getJSON(url, onSuccess, onFailure) {
  var xhr = new XMLHttpRequest();   // create the request object
  xhr.open("GET", url, true);       // true = asynchronous (page keeps working)

  // onload runs when the request finished and a response arrived
  xhr.onload = function () {
    // readyState 4 means DONE. (onload already implies it, but we check to show how it works.)
    if (xhr.readyState !== 4) { return; }

    // status 200-299 means success; anything else is an HTTP error
    if (xhr.status < 200 || xhr.status >= 300) {
      onFailure("The server returned an error (HTTP " + xhr.status + "). Please try again.");
      return;
    }

    // Convert the JSON text into a JavaScript object.
    // If the text isn't valid JSON, JSON.parse throws an error, so we catch it.
    var data;
    try {
      data = JSON.parse(xhr.responseText);
    } catch (e) {
      onFailure("The server sent a response that could not be read.");
      return;
    }
    onSuccess(data);
  };

  // onerror runs when the network fails (offline, blocked, DNS problem, etc.)
  xhr.onerror = function () {
    onFailure("Network error. Check your internet connection and try again.");
  };

  // ontimeout runs if the server takes too long
  xhr.timeout = 10000; // 10 seconds
  xhr.ontimeout = function () {
    onFailure("The request timed out. Please try again.");
  };

  xhr.send(); // actually send the request
}

// ---------- 5. Step 1: Geocoding (city name -> coordinates) ----------
function getWeatherForCity(cityName) {
  var geoUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" +
               encodeURIComponent(cityName) + "&count=1";

  getJSON(geoUrl, function (geoData) {
    // If no city matches, Open-Meteo leaves out the "results" property entirely
    if (!geoData || !Array.isArray(geoData.results) || geoData.results.length === 0) {
      fail('No location found for "' + cityName + '". Check the spelling and try again.');
      return;
    }

    var place = geoData.results[0];

    // Make sure the data we need is really there and is a number
    if (typeof place.latitude !== "number" || typeof place.longitude !== "number") {
      fail("The location data was incomplete. Please try another city.");
      return;
    }

    var locationName = place.name + (place.country ? ", " + place.country : "");

    // Step 2 starts ONLY here, after the first request succeeded
    getCurrentWeather(place.latitude, place.longitude, locationName);
  }, fail);
}

// ---------- 6. Step 2: Weather (coordinates -> current weather) ----------
function getCurrentWeather(latitude, longitude, locationName) {
  var weatherUrl = "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + encodeURIComponent(latitude) +
    "&longitude=" + encodeURIComponent(longitude) +
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m";

  getJSON(weatherUrl, function (weatherData) {
    var current = weatherData && weatherData.current;
    var units   = weatherData && weatherData.current_units;

    // Check that the "current" object exists and has the values we expect
    if (!current ||
        typeof current.temperature_2m !== "number" ||
        typeof current.apparent_temperature !== "number" ||
        typeof current.relative_humidity_2m !== "number" ||
        typeof current.wind_speed_10m !== "number" ||
        typeof current.precipitation !== "number" ||
        typeof current.weather_code !== "number") {
      fail("The weather data was incomplete or in an unexpected format.");
      return;
    }

    showWeather(locationName, current, units);
  }, fail);
}

// ---------- 7. Display the weather on the page ----------
function showWeather(locationName, current, units) {
  units = units || {};

  locationEl.textContent    = locationName;
  temperatureEl.textContent = current.temperature_2m + " " + (units.temperature_2m || "°C");
  conditionEl.textContent   = describeWeatherCode(current.weather_code);
  feelsLikeEl.textContent   = current.apparent_temperature + " " + (units.apparent_temperature || "°C");
  humidityEl.textContent    = current.relative_humidity_2m + " " + (units.relative_humidity_2m || "%");
  windEl.textContent        = current.wind_speed_10m + " " + (units.wind_speed_10m || "km/h");
  precipEl.textContent      = current.precipitation + " " + (units.precipitation || "mm");
  dayNightEl.textContent    = current.is_day === 1 ? "Day" : "Night";

  weatherEl.hidden = false;   // reveal the weather section
  showMessage("", "");        // clear the loading message
  setLoading(false);          // re-enable the button
}

// ---------- 8. Handle the form submit (button click or Enter key) ----------
form.addEventListener("submit", function (event) {
  event.preventDefault();          // stop the page from reloading

  if (isLoading) { return; }       // ignore clicks while a request is running

  var city = cityInput.value.trim();

  // Empty input check
  if (city === "") {
    clearWeather();
    showMessage("Please enter a city name.", "error");
    return;
  }

  clearWeather();                  // remove old results before the new search
  setLoading(true);
  showMessage("Loading weather data...", "loading");
  getWeatherForCity(city);
});

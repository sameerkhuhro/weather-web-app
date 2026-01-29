const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const rainChance = document.getElementById("rainChance");
const forecastDiv = document.getElementById("forecast");
const hourlyContainer = document.getElementById("hourlyContainer");
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");

  // Set correct icon on load
  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "☀️";
  } else {
    themeToggle.textContent = "🌙";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      themeToggle.textContent = "☀️";
      localStorage.setItem("theme", "dark");
    } else {
      themeToggle.textContent = "🌙";
      localStorage.setItem("theme", "light");
    }
  });
});


  // Load saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  } else {
    themeToggle.textContent = "🌙";
  }





searchBtn.addEventListener("click", async () => {
  const city = cityInput.value;

    searchWeather(city);
});



// Geocoding API to get coordinates

async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results) {
    throw new Error("City not found");
  }

  return {
    latitude: data.results[0].latitude,
    longitude: data.results[0].longitude
  };
}

// Weather API to get weather data

async function getWeather(latitude, longitude) {
  const url = `
https://api.open-meteo.com/v1/forecast
?latitude=${latitude}
&longitude=${longitude}
&current_weather=true
&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,weathercode,precipitation_probability
&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max
&timezone=auto
`;

  const res = await fetch(url);
  return await res.json();
}


// Helper function to map weather codes to icons
function getWeatherIcon(code) {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 99) return "⛈️";
}

// Function to display current weather
function showCurrentWeather(city, data) {
  const current = data.current_weather;

  const feelsLikeTemp = data.hourly.apparent_temperature[0];
  const humidityValue = data.hourly.relativehumidity_2m[0];
  const rainToday = data.daily.precipitation_probability_max[0];

  cityName.innerText = city;
  temperature.innerText = `🌡️ ${current.temperature}°C`;
  icon.innerText = getWeatherIcon(current.weathercode);

  document.getElementById("feelsLike").innerText =
    `🤔 Feels like: ${feelsLikeTemp}°C`;

  document.getElementById("humidity").innerText =
    `💧 Humidity: ${humidityValue}%`;

  document.getElementById("wind").innerText =
    `🌬️ Wind: ${current.windspeed} km/h`;

  rainChance.innerText =
    `🌧️ Rain chance: ${rainToday}%`;

    setWeatherBackground(current.weathercode);
}

// Function to set background based on weather

function setWeatherBackground(code) {
  // If dark mode is active, DO NOTHING
  if (document.body.classList.contains("dark")) return;

  document.body.classList.remove("sunny", "cloudy", "rainy", "snowy");

  if (code === 0) {
    document.body.classList.add("sunny");
  } else if (code <= 3) {
    document.body.classList.add("cloudy");
  } else if (code <= 67) {
    document.body.classList.add("rainy");
  } else {
    document.body.classList.add("snowy");
  }
}
// Navbar scroll effect
window.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");

  if (window.scrollY > 10) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});

// searchBtn.addEventListener("click", () => {
//   if (window.innerWidth <= 768) {
//     navMenu.classList.remove("active");
//   }
// });







// Function to display 5-day forecast
function showForecast(data) {
  forecastDiv.innerHTML = ""; // clear old data

  for (let i = 0; i < 5; i++) {
    const day = `
      <div class="day">
        <p>${data.daily.time[i]}</p>
        <p>${getWeatherIcon(data.daily.weathercode[i])}</p>
        <p>
          ${data.daily.temperature_2m_max[i]}° /
          ${data.daily.temperature_2m_min[i]}°
        </p>
        <p>🌧️ ${data.daily.precipitation_probability_max[i]}%</p>
      </div>
    `;

    forecastDiv.innerHTML += day;


  }
}

// Function to display hourly forecast
function showHourly(data) {
  hourlyContainer.innerHTML = ""; // clear old data

  // Show next 24 hours
  for (let i = 0; i < 24; i++) {
    const time = new Date(data.hourly.time[i]);
    const hour = time.getHours();
    const displayHour = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;

    const hourDiv = `
      <div class="hour">
        <p>${displayHour}</p>
        <p>${getWeatherIcon(data.hourly.weathercode[i])}</p>
        <p>${Math.round(data.hourly.temperature_2m[i])}°</p>
        <p>🌧️ ${data.hourly.precipitation_probability[i]}%</p>
      </div>
    `;

    hourlyContainer.innerHTML += hourDiv;
  }
}


function loadCity() {
  const city = localStorage.getItem("lastCity");

  if (city) {
    cityInput.value = city;
    searchWeather(city);
  }
}

function saveCity(city) {
  localStorage.setItem("lastCity", city);
}



async function searchWeather(city) {
    if (!city || city.trim() === "") {
    alert("Please enter a city name");
    return;
  }
  try {
    saveCity(city);

    const { latitude, longitude } = await getCoordinates(city);
    const weatherData = await getWeather(latitude, longitude);

    showCurrentWeather(city, weatherData);
    showHourly(weatherData);
    showForecast(weatherData);
  } catch (error) {
    alert(error.message);
  }
}

window.onload = loadCity;   




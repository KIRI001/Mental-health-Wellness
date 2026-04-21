const apiKey = window.OPENWEATHER_API_KEY || "";
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");
const weatherInfo = document.getElementById("weatherInfo");
const errorDiv = document.getElementById("error");

searchBtn.addEventListener("click", searchWeather);
cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchWeather();
});

function searchWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name");
        return;
    }

    if (!apiKey) {
        showError("Set window.OPENWEATHER_API_KEY before searching weather");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

    fetch(url)
        .then((response) => {
            if (!response.ok) throw new Error("City not found");
            return response.json();
        })
        .then((data) => displayWeather(data))
        .catch((error) => showError(error.message));
}

function displayWeather(data) {
    const { name, main, weather, wind } = data;
    const icon = weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    weatherInfo.innerHTML = `
        <h2>${name}</h2>
        <img src="${iconUrl}" alt="Weather icon" width="80" height="80">
        <p><strong>Temperature:</strong> ${main.temp}°C</p>
        <p><strong>Feels Like:</strong> ${main.feels_like}°C</p>
        <p><strong>Weather:</strong> ${weather[0].main}</p>
        <p><strong>Humidity:</strong> ${main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${wind.speed} m/s</p>
    `;

    weatherResult.classList.add("show");
    errorDiv.classList.remove("show");
    cityInput.value = "";
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.add("show");
    weatherResult.classList.remove("show");
}

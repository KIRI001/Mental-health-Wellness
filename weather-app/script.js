const apiKey = window.OPENWEATHER_API_KEY || "";
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");
const weatherInfo = document.getElementById("weatherInfo");
const errorDiv = document.getElementById("error");
const capitalizeFirst = (text) => text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

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
        showError("API key not configured. Please set window.OPENWEATHER_API_KEY in the console.");
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
    weatherInfo.replaceChildren();

    const title = document.createElement("h2");
    title.textContent = name;

    const iconImage = document.createElement("img");
    iconImage.src = iconUrl;
    iconImage.alt = capitalizeFirst(weather[0].description) || "Current weather conditions";
    iconImage.width = 80;
    iconImage.height = 80;

    const details = [
        ["Temperature", `${main.temp}°C`],
        ["Feels Like", `${main.feels_like}°C`],
        ["Weather", weather[0].main],
        ["Humidity", `${main.humidity}%`],
        ["Wind Speed", `${wind.speed} m/s`]
    ];

    weatherInfo.append(title, iconImage);
    details.forEach(([label, value]) => {
        const row = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = `${label}: `;
        row.append(strong, document.createTextNode(value));
        weatherInfo.appendChild(row);
    });

    weatherResult.classList.add("show");
    errorDiv.classList.remove("show");
    cityInput.value = "";
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.add("show");
    weatherResult.classList.remove("show");
}

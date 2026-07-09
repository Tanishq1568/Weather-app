const API_KEY = "03a094de2fbed757402784c8ab602833";

// Elements
const button = document.querySelector(".button");
const inputvalue = document.querySelector(".search-box");
const locationBtn = document.querySelector("#location-btn");

const temp = document.querySelector(".temp");
const description = document.querySelector(".weather");
const city = document.querySelector(".city");
const date = document.querySelector(".date");

const weatherIcon = document.querySelector(".weather-icon");

const feelsLike = document.querySelector("#feels-like");
const humidity = document.querySelector("#humidity");
const wind = document.querySelector("#wind");
const pressure = document.querySelector("#pressure");
const visibility = document.querySelector("#visibility");
const minMax = document.querySelector("#min-max");

const sunrise = document.querySelector("#sunrise");
const sunset = document.querySelector("#sunset");

const recentSearchesContainer = document.querySelector(
  ".recent-searches"
);

const forecastContainer = document.querySelector(
  ".forecast-container"
);

// ==========================
// Suggestions Box
// ==========================
const suggestionsBox = document.createElement("div");
suggestionsBox.classList.add("suggestions-box");

inputvalue.parentNode.style.position = "relative";
inputvalue.parentNode.appendChild(suggestionsBox);

// ==========================
// Search Weather
// ==========================
async function getWeather(cityName) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error("City not found");
    }

    const weather = await response.json();

    displayData(weather);

    saveRecentSearch(weather.name);

    getForecast(
      weather.coord.lat,
      weather.coord.lon
    );

    setBackground(
      weather.weather[0].main
    );
  } catch (err) {
    alert("City not found!");
    console.log(err);
  }
}

// ==========================
// Display Weather
// ==========================
function displayData(weather) {

  temp.innerHTML =
    `${Math.round(weather.main.temp)}°C`;

  description.innerText =
    weather.weather[0].description;

  city.innerText =
    `${weather.name}, ${weather.sys.country}`;

  date.innerText =
    dateBuilder(new Date());

  weatherIcon.src =
    `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;

  feelsLike.innerText =
    `${Math.round(weather.main.feels_like)}°C`;

  humidity.innerText =
    `${weather.main.humidity}%`;

  wind.innerText =
    `${weather.wind.speed} m/s`;

  pressure.innerText =
    `${weather.main.pressure} hPa`;

  visibility.innerText =
    `${weather.visibility / 1000} km`;

  minMax.innerText =
    `${Math.round(weather.main.temp_min)}° / ${Math.round(weather.main.temp_max)}°`;

  sunrise.innerText =
    formatTime(weather.sys.sunrise);

  sunset.innerText =
    formatTime(weather.sys.sunset);
}

// ==========================
// Date Builder
// ==========================
function dateBuilder(d) {

  const months = [
    "January","February","March",
    "April","May","June",
    "July","August","September",
    "October","November","December"
  ];

  const days = [
    "Sunday","Monday","Tuesday",
    "Wednesday","Thursday",
    "Friday","Saturday"
  ];

  return `${days[d.getDay()]},
  ${d.getDate()} ${months[d.getMonth()]}
  ${d.getFullYear()}`;
}

// ==========================
// Time Formatter
// ==========================
function formatTime(unixTime) {

  const date = new Date(unixTime * 1000);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

// ==========================
// Button Search
// ==========================
button.addEventListener("click", () => {

  if(inputvalue.value.trim() !== ""){
    getWeather(inputvalue.value.trim());
  }

});

// ==========================
// Enter Search
// ==========================
inputvalue.addEventListener(
  "keypress",
  (e) => {

    if(e.key === "Enter"){

      getWeather(
        inputvalue.value.trim()
      );

      suggestionsBox.innerHTML = "";
    }

  }
);

// ==========================
// Suggestions
// ==========================
inputvalue.addEventListener(
  "input",
  async () => {

    const query =
      inputvalue.value.trim();

    if(query.length < 2){
      suggestionsBox.innerHTML = "";
      return;
    }

    try{

      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );

      const cities =
        await response.json();

      suggestionsBox.innerHTML = "";

      cities.forEach((cityData)=>{

        const item =
          document.createElement("div");

        item.innerText =
          `${cityData.name}, ${cityData.country}`;

        item.addEventListener(
          "click",
          ()=>{

            inputvalue.value =
              cityData.name;

            suggestionsBox.innerHTML =
              "";

            getWeather(
              cityData.name
            );
          }
        );

        suggestionsBox.appendChild(item);
      });

    }catch(err){
      console.log(err);
    }

  }
);

// ==========================
// Close Suggestions
// ==========================
document.addEventListener(
  "click",
  (e)=>{

    if(
      !inputvalue.contains(e.target)
      &&
      !suggestionsBox.contains(e.target)
    ){
      suggestionsBox.innerHTML = "";
    }

  }
);

// ==========================
// Current Location
// ==========================
locationBtn.addEventListener(
  "click",
  ()=>{

    navigator.geolocation.getCurrentPosition(
      async(position)=>{

        const lat =
          position.coords.latitude;

        const lon =
          position.coords.longitude;

        const response =
          await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
          );

        const weather =
          await response.json();

        displayData(weather);

        getForecast(lat, lon);

        saveRecentSearch(
          weather.name
        );

        setBackground(
          weather.weather[0].main
        );

      },
      ()=>{
        alert(
          "Location access denied."
        );
      }
    );

  }
);

// ==========================
// Forecast
// ==========================
async function getForecast(
  lat,
  lon
){

  try{

    const response =
      await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&forecast_days=10&timezone=auto`
      );

    const data =
      await response.json();

    forecastContainer.innerHTML = "";

    data.daily.time.forEach(
      (day,index)=>{

        const card =
          document.createElement("div");

        card.classList.add(
          "forecast-card"
        );

        card.innerHTML = `
          <h4>${day}</h4>
          <p>⬆ ${data.daily.temperature_2m_max[index]}°C</p>
          <p>⬇ ${data.daily.temperature_2m_min[index]}°C</p>
        `;

        forecastContainer.appendChild(
          card
        );
      }
    );

  }catch(err){
    console.log(err);
  }

}

// ==========================
// Recent Searches
// ==========================
function saveRecentSearch(city){

  let cities =
    JSON.parse(
      localStorage.getItem(
        "recentCities"
      )
    ) || [];

  cities = cities.filter(
    c => c !== city
  );

  cities.unshift(city);

  cities = cities.slice(0,5);

  localStorage.setItem(
    "recentCities",
    JSON.stringify(cities)
  );

  loadRecentSearches();
}

function loadRecentSearches(){

  const cities =
    JSON.parse(
      localStorage.getItem(
        "recentCities"
      )
    ) || [];

  recentSearchesContainer.innerHTML = "";

  cities.forEach(city=>{

    const item =
      document.createElement("div");

    item.classList.add(
      "recent-item"
    );

    item.innerText = city;

    item.addEventListener(
      "click",
      ()=>getWeather(city)
    );

    recentSearchesContainer.appendChild(
      item
    );

  });

}

function setBackground(type){

  type = type.toLowerCase();

  if(type.includes("clear")){
    document.body.style.backgroundImage =
      "url('./images/clear.jpg')";
  }
  else if(type.includes("cloud")){
    document.body.style.backgroundImage =
      "url('./images/clouds.jpg')";
  }
  else if(type.includes("rain")){
    document.body.style.backgroundImage =
      "url('./images/rain.jpg')";
  }
  else if(type.includes("snow")){
    document.body.style.backgroundImage =
      "url('./images/snow.jpg')";
  }
  else if(type.includes("thunder")){
    document.body.style.backgroundImage =
      "url('./images/thunderstorm.jpg')";
  }
  else{
    document.body.style.backgroundImage =
      "url('./images/background.jpg')";
  }
}

loadRecentSearches();

getWeather("Jaipur");
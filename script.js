const apiKey = "f97b1a93ff2bf3205daedf4b8b5a1545";

const apiUrl =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";


// ======================
// MAP VARIABLES
// ======================

let map;
let weatherLayer;


// ======================
// MAP ELEMENTS
// ======================

const liveMapBtn = document.querySelector("#liveMapBtn");
const mapSection = document.querySelector("#mapSection");
const closeMap = document.querySelector("#closeMap");
const navbar = document.querySelector(".navbar");


// ======================
// OPEN MAP
// ======================

liveMapBtn.addEventListener("click", function (e) {

  e.preventDefault();

  // Hide navbar
  navbar.style.display = "none";

  // Show map
  mapSection.style.display = "block";


  // Create map only once
  if (!map) {

    map = L.map("map").setView(
      [28.6692, 77.4538],
      8
    );


    // Normal map
    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors"
      }
    ).addTo(map);


    // Weather precipitation layer
    weatherLayer = L.tileLayer(
  `https://maps.openweathermap.org/maps/2.0/weather/PA0/{z}/{x}/{y}?appid=${apiKey}`,
  {
    opacity: 0.8,
    zIndex: 10
  }
     ).addTo(map);
  }


  // Scroll to map
  mapSection.scrollIntoView({
    behavior: "smooth"
  });


  // Fix Leaflet map size
  setTimeout(() => {

    map.invalidateSize();

  }, 300);

});


// ======================
// CLOSE MAP
// ======================

closeMap.addEventListener("click", () => {

  mapSection.style.display = "none";

  navbar.style.display = "flex";

});


// ======================
// WEATHER VARIABLES
// ======================

const searchBox =
  document.querySelector(".search input");

const searchBtn =
  document.querySelector(".search button");

const weatherIcon =
  document.querySelector(".weather-icon");


// ======================
// CHECK WEATHER
// ======================

async function checkweather(city) {

  const response = await fetch(
    apiUrl + city + `&appid=${apiKey}`
  );


  // City not found
  if (response.status == 404) {

    document.querySelector(".weather").style.display = "none";

    document.querySelector(".error").style.display = "block";

    return;
  }


  const data = await response.json();

  console.log(data);


  // ======================
  // MOVE MAP TO CITY
  // ======================

  if (map) {

    map.setView(
      [data.coord.lat, data.coord.lon],
      10
    );

  }


  // ======================
  // WEATHER INFORMATION
  // ======================

  document.querySelector(".city").innerHTML =
    data.name;

  document.querySelector(".temp").innerHTML =
    Math.round(data.main.temp) + "℃";

  document.querySelector(".humidity").innerHTML =
    data.main.humidity + "%";

  document.querySelector(".Wind").innerHTML =
    data.wind.speed + " km/h";


  // ======================
  // WEATHER ICON
  // ======================

  if (data.weather[0].main == "Clouds") {

    weatherIcon.src = "images/clouds.png";

  }

  else if (data.weather[0].main == "Clear") {

    weatherIcon.src = "images/clear.png";

  }

  else if (data.weather[0].main == "Rain") {

    weatherIcon.src = "images/rain.png";

  }

  else if (data.weather[0].main == "Drizzle") {

    weatherIcon.src = "images/drizzle.png";

  }

  else if (data.weather[0].main == "Mist") {

    weatherIcon.src = "images/mist.png";

  }

  else if (data.weather[0].main == "Snow") {

    weatherIcon.src = "images/snow.png";

  }


  // Show weather
  document.querySelector(".weather").style.display =
    "block";

  document.querySelector(".error").style.display =
    "none";

}


// ======================
// SEARCH BUTTON
// ======================

searchBtn.addEventListener("click", () => {

  const city = searchBox.value.trim();

  if (city !== "") {

    checkweather(city);

  }

});
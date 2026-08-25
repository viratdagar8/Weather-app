const apiKey = "f97b1a93ff2bf3205daedf4b8b5a1545";

const apiUrl =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";


// ======================
// MAP VARIABLES
// ======================

let map;
let weatherLayer;
let radarFrames = [];
let radarIndex = 0;
let radarTimer = null;
let radarHost = "";

// ======================
// MAP ELEMENTS
// ======================

const radarMapBtn = document.querySelector("#radarMapBtn");
const mapSection = document.querySelector("#mapSection");
const closeMap = document.querySelector("#closeMap");
const navbar = document.querySelector(".navbar");


// ======================
// LOAD RADAR
// ======================
        async function addRadarLayer() {

          try {

            const response = await fetch(
              "https://api.rainviewer.com/public/weather-maps.json"
            );

            const data = await response.json();

            console.log("Radar data:", data);

            // Host
            radarHost = data.host;

            // Past radar frames
            radarFrames = data.radar.past;

            console.log("Radar frames:", radarFrames);

            // Timeline maximum
            document.querySelector("#radarTimeline").max =
              radarFrames.length - 1;

            // Start with latest frame
            radarIndex = radarFrames.length - 1;

            showRadarFrame(radarIndex);

          } catch (error) {

            console.error("Radar loading error:", error);

          }
        }

         function showRadarFrame(index) {

          if (!radarFrames.length) {
            return;
          }

          const frame = radarFrames[index];

          const radarUrl =
            `${radarHost}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;

          // Purana radar layer remove
          if (weatherLayer) {
            map.removeLayer(weatherLayer);
          }

          // New radar frame
          weatherLayer = L.tileLayer(
            radarUrl,
            {
              opacity: 0.75,
              zIndex: 10,
              maxZoom: 7
            }
          ).addTo(map);


          // Timeline update
          document.querySelector("#radarTimeline").value = index;


          // Time display
          const date = new Date(frame.time * 1000);

          document.querySelector("#radarTime").innerHTML =
            date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            });
        }
                 
        //==========================
        //Play button
        //==========================

        const playRadar = document.querySelector("#playRadar");

        playRadar.addEventListener("click", () => {

          if (radarTimer) {
            return;
          }

          radarTimer = setInterval(() => {

            radarIndex++;

            // Last frame ke baad first frame
            if (radarIndex >= radarFrames.length) {
              radarIndex = 0;
            }

            showRadarFrame(radarIndex);

          }, 800);

        });
        //===============================
        //Pause button
        //============================
         const pauseRadar = document.querySelector("#pauseRadar");

          pauseRadar.addEventListener("click", () => {

            clearInterval(radarTimer);

            radarTimer = null;

          });

          //====================
          //TIMELINE
          //====================
        const radarTimeline =
          document.querySelector("#radarTimeline");

          radarTimeline.addEventListener("input", () => {

          radarIndex = Number(radarTimeline.value);

          showRadarFrame(radarIndex);

        });



// ======================
// OPEN RADAR MAP
// ======================

radarMapBtn.addEventListener("click", function (e) {

  e.preventDefault();

  earthquakeSection.style.display = "none";
  navbar.style.display = "none";
  mapSection.style.display = "block";


  // Create map only once
  if (!map) {

    map = L.map("map").setView(
      [28.6692, 77.4538],
      7
    );


    // Base map
    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          "&copy; OpenStreetMap contributors"
      }
    ).addTo(map);


    // 🌧️ RADAR LAYER
    addRadarLayer();

  }


  mapSection.scrollIntoView({
    behavior: "smooth"
  });


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
// EARTHQUAKE ELEMENTS
// ======================

const earthquakeBtn = document.querySelector("#earthquakeBtn");
const earthquakeSection = document.querySelector("#earthquakeSection");
const closeEarthquake = document.querySelector("#closeEarthquake");
const earthquakeList = document.querySelector("#earthquakeList");
const earthquakeStatus = document.querySelector("#earthquakeStatus");
const earthquakeRange = document.querySelector("#earthquakeRange");

let earthquakesLoaded = false;

const USGS_FEED_BASE =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/";


// ======================
// MAGNITUDE → SEVERITY CLASS
// ======================

function magnitudeClass(mag) {

  if (mag === null || mag === undefined) {
    return "mag-low";
  }

  if (mag < 4) {
    return "mag-low";
  } else if (mag < 5) {
    return "mag-mid";
  } else if (mag < 6) {
    return "mag-high";
  } else {
    return "mag-severe";
  }

}


// ======================
// RELATIVE TIME LABEL
// ======================

function timeAgo(timestamp) {

  const diffMs = Date.now() - timestamp;
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) {
    return "just now";
  } else if (diffMin < 60) {
    return `${diffMin} min ago`;
  }

  const diffHrs = Math.round(diffMin / 60);

  if (diffHrs < 24) {
    return `${diffHrs} hr ago`;
  }

  const diffDays = Math.round(diffHrs / 24);

  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

}


// ======================
// LOAD EARTHQUAKES
// ======================

async function loadEarthquakes(feedName) {

  earthquakeStatus.style.display = "block";
  earthquakeStatus.textContent = "Loading recent earthquakes…";
  earthquakeList.innerHTML = "";

  try {

    const response = await fetch(
      `${USGS_FEED_BASE}${feedName}.geojson`
    );

    if (!response.ok) {
      throw new Error("USGS request failed");
    }

    const data = await response.json();

    const quakes = data.features;

    if (!quakes.length) {
      earthquakeStatus.textContent =
        "No earthquakes matched this filter right now.";
      return;
    }

    earthquakeStatus.style.display = "none";

    quakes
      .sort((a, b) => b.properties.time - a.properties.time)
      .forEach((quake) => {

        const props = quake.properties;
        const mag = props.mag;
        const magLabel =
          typeof mag === "number" ? mag.toFixed(1) : "?";

        const li = document.createElement("li");

        const row = document.createElement("a");
        row.className = "quake-row";
        row.href = props.url;
        row.target = "_blank";
        row.rel = "noopener";

        row.innerHTML = `
          <div class="quake-mag ${magnitudeClass(mag)}">${magLabel}</div>
          <div class="quake-info">
            <div class="quake-place">${props.place || "Unknown location"}</div>
            <div class="quake-time">${timeAgo(props.time)}</div>
          </div>
        `;

        li.appendChild(row);
        earthquakeList.appendChild(li);

      });

  } catch (error) {

    console.error("Earthquake loading error:", error);

    earthquakeStatus.textContent =
      "Couldn't load earthquake data right now. Please try again shortly.";

  }

}


// ======================
// OPEN EARTHQUAKE PANEL
// ======================

earthquakeBtn.addEventListener("click", function (e) {

  e.preventDefault();

  mapSection.style.display = "none";
  navbar.style.display = "none";
  earthquakeSection.style.display = "block";

  if (!earthquakesLoaded) {
    earthquakesLoaded = true;
    loadEarthquakes(earthquakeRange.value);
  }

  earthquakeSection.scrollIntoView({ behavior: "smooth" });

});


// ======================
// CLOSE EARTHQUAKE PANEL
// ======================

closeEarthquake.addEventListener("click", () => {

  earthquakeSection.style.display = "none";
  navbar.style.display = "flex";

});


// ======================
// CHANGE EARTHQUAKE FILTER
// ======================

earthquakeRange.addEventListener("change", () => {

  loadEarthquakes(earthquakeRange.value);

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

      // Search ki hui city par radar map center karo
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

const themeToggle = document.querySelector("#themeToggle");

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeToggle.innerHTML = "☀️ Light";
    } else {
        themeToggle.innerHTML = "🌙 Dark";
    }

});
const API_KEY = "554ab32cdcc54d5c978184256261105";
async function getWeather(city) {
  city = city || document.getElementById("cityInput").value.trim() || "Bhagalpur";
  localStorage.setItem("lastCity", city);

  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=7&aqi=yes`
    );
    const d = await res.json();
    if (d.error) { showError(d.error.message); return; }

    renderMain(d);
  } catch (e) {
    showError("Network error. Please try again.");
  }
}
function renderMain(d) {
  const cur = d.current;
  const loc = d.location;
  const day0 = d.forecast.forecastday[0];
  const astro = day0.astro;

  document.getElementById("cityName").textContent = loc.name;
  document.getElementById("countryName").textContent = loc.country;
  document.getElementById("localTime").textContent = loc.localtime;
  document.getElementById("temperature").textContent = `${Math.round(cur.temp_c)}°`;
  document.getElementById("condition").textContent = cur.condition.text;
  document.getElementById("condIcon").src = "https:" + cur.condition.icon;
  document.getElementById("feelsLike").textContent = `${Math.round(cur.feelslike_c)}°C`;
  document.getElementById("precipitation").textContent = cur.precip_mm;
  document.getElementById("sunrise").textContent = astro.sunrise;
  document.getElementById("sunset").textContent = astro.sunset;
  document.getElementById("highlow").textContent =`${Math.round(day0.day.maxtemp_c)}° / ${Math.round(day0.day.mintemp_c)}°`;
  const hum = cur.humidity;
  document.getElementById("humidity").textContent = `${hum}%`;
  document.getElementById("humidityBar").style.width = hum + "%";

  document.getElementById("wind").textContent = Math.round(cur.wind_kph);
  document.getElementById("windDir").innerHTML = `<i class="fa-solid fa-compass mr-1 text-indigo-400"></i>${cur.wind_dir} direction`;

  const vis = cur.vis_km;
  document.getElementById("visibility").textContent = vis;
  document.getElementById("visibilityLabel").textContent =vis >= 10 ? "☀️ Excellent" : vis >= 5 ? "🌤 Good" : vis >= 2 ? "🌫 Moderate" : "🌁 Poor";

  const uv = cur.uv;
  document.getElementById("uv").textContent = uv;
  const uvPct = Math.min((uv / 12) * 100, 100);
  document.getElementById("uvIndicator").style.left = uvPct + "%";
  document.getElementById("uvLabel").textContent =uv <= 2 ? "Low" : uv <= 5 ? "Moderate" : uv <= 7 ? "High" : uv <= 10 ? "Very High" : "Extreme";
  const aq = cur.air_quality;
  const pm25val = +(aq["pm2_5"] || 0).toFixed(1);
  const aqiNum = Math.round(pm25val * 4.5); 
  document.getElementById("aqi").textContent = aqiNum;
  document.getElementById("pm25").textContent = pm25val;
  document.getElementById("pm10").textContent = +(aq["pm10"] || 0).toFixed(1);
  document.getElementById("co").textContent = +(aq["co"] || 0).toFixed(0);

  const aqiPct = Math.min((aqiNum / 300) * 100, 100);
  document.getElementById("aqiDot").style.left = aqiPct + "%";

  const aqiBadge = document.getElementById("aqiBadge");
  if (aqiNum <= 50) { aqiBadge.textContent = "✅ Good"; aqiBadge.style.color = "#34d399"; }
  else if (aqiNum <= 100) { aqiBadge.textContent = "🟡 Moderate"; aqiBadge.style.color = "#fbbf24"; }
  else if (aqiNum <= 150) { aqiBadge.textContent = "🟠 Unhealthy for Sensitive"; aqiBadge.style.color = "#f97316"; }
  else { aqiBadge.textContent = "🔴 Unhealthy"; aqiBadge.style.color = "#f43f77"; }

  let hourlyHTML = "";
  const hours = day0.hour;
  for (let i = 0; i < hours.length; i += 1) {
    const h = hours[i];
    const time = h.time.split(" ")[1].slice(0,5);
    const isPM = parseInt(time) >= 12;
    hourlyHTML += `<div class="hour-card glass rounded-2xl p-4 flex flex-col items-center gap-2 shrink-0">
    <p class="text-xs text-white/40 font-mono">${time}</p>
    <img src="https:${h.condition.icon}" class="w-12 h-12 wx-icon" alt="">
    <p class="text-lg font-black">${Math.round(h.temp_c)}°</p>
    <p class="text-xs text-white/30">${h.chance_of_rain}% 💧</p>
    </div>`;
  }
  document.getElementById("hourlyForecast").innerHTML = hourlyHTML;
  
  let fcHTML = "";
  d.forecast.forecastday.forEach((day, i) => {
    const dt = new Date(day.date);
    const label = i === 0 ? "Today" : dt.toLocaleDateString('en-US',{weekday:'short'});
    const lo = Math.round(day.day.mintemp_c);
    const hi = Math.round(day.day.maxtemp_c);
    const allLo = Math.min(...d.forecast.forecastday.map(x => x.day.mintemp_c));
    const allHi = Math.max(...d.forecast.forecastday.map(x => x.day.maxtemp_c));
    const span = allHi - allLo || 1;
    const leftPct = ((lo - allLo) / span * 100).toFixed(0);
    const widthPct = ((hi - lo) / span * 100).toFixed(0);

    fcHTML += `
    <div class="forecast-row">
      <p class="text-sm font-semibold w-12 shrink-0">${label}</p>
      <img src="https:${day.day.condition.icon}" class="w-8 h-8 shrink-0 wx-icon" alt="">
      <p class="text-xs text-white/35 w-7 text-right shrink-0">${lo}°</p>
      <div class="range-track">
        <div class="range-fill" style="left:${leftPct}%;width:${widthPct}%;"></div>
      </div>
      <p class="text-sm font-bold w-7 shrink-0">${hi}°</p>
      <p class="text-xs text-white/30 w-12 text-right shrink-0">${day.day.daily_chance_of_rain}%💧</p>
    </div>`;
  });
  document.getElementById("forecast").innerHTML = fcHTML;
}
const SIDE_CITIES = {
  bhagalpur: { el: 'bhagalpur', query: 'bhagalpur' },
  mumbai: { el: 'mumbai', query: 'Mumbai' },
  bhopal: { el: 'bhopal', query: 'Bhopal' },
  Bengaluru: { el: 'Bengaluru', query: 'Bengaluru' },
};

async function loadSideCity(key, query) {
  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(query)}&aqi=no`
    );
    const d = await res.json();
    if (d.error) return;
    const tEl = document.getElementById(`sc-temp-${key}`);
    const cEl = document.getElementById(`sc-cond-${key}`);
    if (tEl) tEl.textContent = `${Math.round(d.current.temp_c)}°`;
    if (cEl) cEl.textContent = d.current.condition.text;
  } catch(e) {}
}

function quickSearch(city) {
  document.getElementById("cityInput").value = city;
  getWeather(city);
}

function showError(msg) {
  document.getElementById("cityName").textContent = "Not Found";
  document.getElementById("temperature").textContent = "—°";
  document.getElementById("condition").textContent = msg;
}
window.addEventListener("load", () => {
  getWeather("bhagalpur");
  Object.entries(SIDE_CITIES).forEach(([k, v]) => loadSideCity(k, v.query));
});

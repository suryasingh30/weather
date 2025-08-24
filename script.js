const apiKey = "ee663bb479224528b1261446252408"; 
const baseUrl = "https://api.weatherapi.com/v1";

const usernameModal = new bootstrap.Modal(document.getElementById('usernameModal'));
const mainContent = document.getElementById('mainContent');
const userAvatar = document.getElementById('userAvatar');
const welcomeText = document.getElementById('welcomeText');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const changeUserBtn = document.getElementById('changeUser');

window.addEventListener('DOMContentLoaded', () => {
    const savedUsername = localStorage.getItem('weatherAppUsername');
    if (savedUsername) {
        setUsername(savedUsername);
        mainContent.style.display = 'block';
        getWeather("London");
    } else {
        usernameModal.show();
    }
});

document.getElementById('saveUsername').addEventListener('click', () => {
    const username = document.getElementById('usernameInput').value.trim();
    if (username) {
        localStorage.setItem('weatherAppUsername', username);
        setUsername(username);
        usernameModal.hide();
        mainContent.style.display = 'block';
        getWeather("London");
    }
});

changeUserBtn.addEventListener('click', () => {
    localStorage.removeItem('weatherAppUsername');
    mainContent.style.display = 'none';
    usernameModal.show();
});

function setUsername(username) {
    userAvatar.textContent = username.charAt(0).toUpperCase();
    welcomeText.textContent = `Welcome, ${username}`;
}

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const location = searchInput.value.trim();
    if (location) {
        getWeather(location);
        searchInput.value = '';
    }
});

document.querySelectorAll('.dropdown-item[data-city]').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        getWeather(e.target.getAttribute('data-city'));
    });
});

async function getWeather(location) {
    try {
        document.getElementById('currentCity').textContent = "Loading...";
        
        const response = await fetch(`${baseUrl}/forecast.json?key=${apiKey}&q=${location}&days=5`);
        if (!response.ok) {
            throw new Error("Failed to fetch weather data");
        }
        
        const data = await response.json();
        console.log("Weather Data:", data);
        
        updateCurrentWeather(data);
        
        updateForecast(data);
        
    } catch (error) {
        console.error(error);
        document.getElementById('currentCity').textContent = "Error loading data";
        alert("Could not fetch weather data. Please try again with a different location.");
    }
}

function updateCurrentWeather(data) {
    const { location, current } = data;
    
    document.getElementById('currentCity').textContent = `${location.name}, ${location.country}`;
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById('currentTemp').textContent = `${current.temp_c}°C`;
    
    const conditionText = current.condition ? current.condition.text : "Data not available";
    document.getElementById('weatherCondition').textContent = conditionText;
    
    const weatherIcon = document.getElementById('weatherIcon');
    if (current.condition && current.condition.text.toLowerCase().includes('sun')) {
        weatherIcon.className = 'fas fa-sun';
    } else if (current.condition && current.condition.text.toLowerCase().includes('cloud')) {
        weatherIcon.className = 'fas fa-cloud';
    } else if (current.condition && current.condition.text.toLowerCase().includes('rain')) {
        weatherIcon.className = 'fas fa-cloud-rain';
    } else if (current.condition && current.condition.text.toLowerCase().includes('snow')) {
        weatherIcon.className = 'fas fa-snowflake';
    } else {
        weatherIcon.className = 'fas fa-cloud-sun';
    }
    
    document.getElementById('windInfo').textContent = `${current.wind_kph} km/h`;
    document.getElementById('windDegree').textContent = `${current.wind_degree}°`;
    
    document.getElementById('humidity').textContent = `${current.humidity}%`;
    document.getElementById('cloud').textContent = `${current.cloud}%`;
    document.getElementById('pressure').textContent = `${current.pressure_mb} hPa`;
    
    const { astro } = data.forecast.forecastday[0];
    document.getElementById('sunrise').textContent = astro.sunrise;
    document.getElementById('sunset').textContent = astro.sunset;
    
    const { day } = data.forecast.forecastday[0];
    document.getElementById('maxTemp').textContent = `${day.maxtemp_c}°C`;
    document.getElementById('minTemp').textContent = `${day.mintemp_c}°C`;
    
    updateHourlyForecast(data.forecast.forecastday[0].hour);
}

function updateHourlyForecast(hourlyData) {
    const hourlyForecast = document.getElementById('hourlyForecast');
    hourlyForecast.innerHTML = '';
    
    const now = new Date();
    const currentHour = now.getHours();
    
    for (let i = currentHour; i < currentHour + 12; i++) {
        const hour = i % 24;
        const hourData = hourlyData[hour];
        
        const hourItem = document.createElement('div');
        hourItem.className = 'hour-item';
        
        const hourTime = document.createElement('div');
        hourTime.className = 'h6';
        hourTime.textContent = `${hour}:00`;
        
        const hourIcon = document.createElement('div');
        hourIcon.className = 'my-2';
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-cloud-sun';
        
        const hourTemp = document.createElement('div');
        hourTemp.className = 'h5';
        hourTemp.textContent = `${hourData.temp_c}°C`;
        
        const hourWind = document.createElement('div');
        hourWind.className = 'small';
        hourWind.textContent = `${hourData.wind_kph} km/h`;
        
        hourIcon.appendChild(icon);
        hourItem.appendChild(hourTime);
        hourItem.appendChild(hourIcon);
        hourItem.appendChild(hourTemp);
        hourItem.appendChild(hourWind);
        
        hourlyForecast.appendChild(hourItem);
    }
}

function updateForecast(data) {
    const forecastContainer = document.getElementById('fiveDayForecast');
    forecastContainer.innerHTML = '';
    
    data.forecast.forecastday.forEach(dayData => {
        const date = new Date(dayData.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const col = document.createElement('div');
        col.className = 'col';
        
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        
        forecastDay.innerHTML = `
            <div class="h5">${dayName}</div>
            <div class="my-2">
                <i class="fas fa-cloud-sun"></i>
            </div>
            <div class="h5">${dayData.day.maxtemp_c}°C</div>
            <div class="small">${dayData.day.mintemp_c}°C</div>
        `;
        
        col.appendChild(forecastDay);
        forecastContainer.appendChild(col);
    });
}

const savedUsername = localStorage.getItem('weatherAppUsername');
if (savedUsername) {
    setUsername(savedUsername);
    mainContent.style.display = 'block';
    getWeather("London");
}
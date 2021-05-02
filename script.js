"use strict";

const container = document.querySelector('.container');

const currentTemperature = document.querySelector('.overview__temperature');
const currentInfo = document.querySelector('.overview__info');
const currentIcon = document.querySelector('.overview__image--icon');
const currentCity = document.querySelector('.overview__city');
const currentGeo = document.querySelector('.overview__geo');
const currentTime = document.querySelector('.overview__time');

const input = document.querySelector('.search__input');
const button = document.querySelector('.search__button');
const searchIcon = document.querySelector('.search__icon');
const formSearch = document.getElementById('formSearch');

const forecast = document.querySelectorAll('.week');

const popup = document.querySelector('.popup');
const closePopup = document.querySelector('.popup__close');
const footer = document.querySelector('footer');



// RENDER POSITION AND GEO
const renderCurrent = function (data) {
    currentGeo.innerHTML = data.name + ',' + data.sys.country;
    currentTemperature.innerHTML = Math.round(data.main.temp) + '&deg;' + 'C';
    let description = data.weather[0].description;
    currentInfo.innerHTML = description[0].toUpperCase() + description.slice(1);

    let iconcode = data.weather[0].icon;
    let iconurl = "http://openweathermap.org/img/wn/" + iconcode + "@2x" + ".png";
    $('.overview__image--icon').attr('src', iconurl);

    let currPosition = new Date(data.dt * 1000).toLocaleDateString("en", {
        weekday: "long",
    });
    currentCity.innerHTML = currPosition;

    let maxTemp = document.querySelector('.info__description--max');
    maxTemp.innerHTML = Math.round(data.main.temp_max) + '&deg;' + 'C';

    let minTemp = document.querySelector('.info__description--min');
    minTemp.innerHTML = Math.round(data.main.temp_min) + '&deg;' + 'C';

    let visibility = document.querySelector('.info__visibility');
    visibility.innerHTML = data.visibility / 1000 + 'km/h';

    let fellsLike = document.querySelector('.info__feels');
    fellsLike.innerHTML = Math.round(data.main.feels_like) + '&deg;' + 'C';

    let humidity = document.querySelector('.info__humidity');
    humidity.innerHTML = data.main.humidity + '%';

    let wind = document.querySelector('.info__wind');
    wind.innerHTML = Math.round(data.wind.speed) + 'km/h';

    let dateSunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en', {
        hour: 'numeric',
        minute: 'numeric'
    });
    let dateSunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en', {
        hour: 'numeric',
        minute: 'numeric'
    })
    let sunrise = document.querySelector('.info__description--sunrise');
    sunrise.innerHTML = dateSunrise;
    let sunset = document.querySelector('.info__description--sunset');
    sunset.innerHTML = dateSunset;
};



//RENDER MAP
const renderMap = function (coords) {
    let container = L.DomUtil.get('map');
    if (container != null) {
        container._leaflet_id = null;
    }

    let map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker(coords).addTo(map)
        .openPopup();
}



//GET CURRENT 
const getCurrentWeather = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            let coords = [lat, lon];
            console.log(coords)
            renderMap(coords);

            fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=3097601d64be20b81766b66b68fa3330`)
                .then(res => {
                    if (!res.ok) throw new Error(`${res.status}`)
                    return res.json()
                })
                .then(data => {
                    console.log(data);
                    renderCurrent(data);
                    fetchForecast();
                })
        });
    }
};
getCurrentWeather();



//SEARCH
formSearch.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let formatedInput = input.value[0].toUpperCase() + input.value.slice(1);
    fetch(`http://api.openweathermap.org/data/2.5/weather?q=${formatedInput}&units=metric&appid=3097601d64be20b81766b66b68fa3330`)
        .then(res => {
            if (!res.ok) throw new Error(`${res.status}`)
            return res.json()
        })
        .then(data => {
            renderCurrent(data);
            let inputCoords = [data.coord.lat, data.coord.lon];
            let lat = data.coord.lat;
            let lon = data.coord.lon;
            console.log(inputCoords);
            console.log(data);
            renderMap(inputCoords);
            fetchForecastFromInput(lat,lon);
        })
        .catch(function (err) {
            if(err) {
                input.style.border = "1px solid red";
                searchIcon.style.fill = "red";
                setInterval(() => {
                    input.style.border = "";
                    searchIcon.style.fill = "";
                }, 3000);
            }
            console.log("Invalid value", err);
        })
});



//GET FORECAST
const fetchForecast = () => {
    $('.week__item').remove();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            console.log(lat, lon);

            const endpoint = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=3097601d64be20b81766b66b68fa3330`;

            fetch(endpoint)
                .then(response => {
                    if (!response.ok) throw new Error(`${response.status}`)
                    return response.json()
                })
                .then(data => {
                    console.log(data);
                    let fday = "";
                    data.daily.forEach((value, index) => {
                        if (index > 0) {
                            let dayname = new Date(value.dt * 1000).toLocaleDateString("en", {
                                weekday: "short",
                            });
                            let temp = value.temp.day.toFixed(0);

                            let iconcodeForecast = value.weather[0].icon;
                            let iconForecast = "http://openweathermap.org/img/wn/" + iconcodeForecast + ".png";

                            fday = `<div class="week__item">
                            <p class="week__day">${dayname}</p>
                            <img src="${iconForecast}" alt="Forecast icon" class="week__iconForecast">
                            <div class="week__temp">${temp}&deg;C</div>
                            </div>`;
                            forecast[0].insertAdjacentHTML('beforeend', fday);
                        }
                    });
                })
                .catch(function (err) {
                    console.log("Fetch Error :", err);
                })
        });
    }
};



//GET FORECAST FROM INPUT
const fetchForecastFromInput = (lat, lon) => {

    const endpoint = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=3097601d64be20b81766b66b68fa3330`;
    $('.week__item').remove();
    fetch(endpoint)
        .then(response => {
            if (!response.ok) throw new Error(`${response.status}`)
            return response.json()
        })
        .then(data => {
            console.log(data);
            let fday = "";
            data.daily.forEach((value, index) => {
                if (index > 0) {
                    let dayname = new Date(value.dt * 1000).toLocaleDateString("en", {
                        weekday: "short",
                    });
                    let temp = value.temp.day.toFixed(0);

                    let iconcodeForecast = value.weather[0].icon;
                    let iconForecast = "http://openweathermap.org/img/wn/" + iconcodeForecast + ".png";

                    fday = `<div class="week__item">
                            <p class="week__day">${dayname}</p>
                            <img src="${iconForecast}" alt="Forecast icon" class="week__iconForecast">
                            <div class="week__temp">${temp}&deg;C</div>
                            </div>`;
                    forecast[0].insertAdjacentHTML('beforeend', fday);
                }
            });
        })
        .catch(function (err) {
            console.log("Fetch Error :", err);
        })
};



//POPUP
const displayContent = function () {
    footer.style.opacity = 0;
    container.style.opacity = 0;
    closePopup.addEventListener('click', function (e) {
        if(e.target) {
            footer.style.opacity = 1;
            container.style.opacity = 1;
            popup.style.display = 'none';
        }
    });
};
displayContent();

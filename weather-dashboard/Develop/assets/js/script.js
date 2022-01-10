var searchFormEl = document.querySelector('#search-form');
var previousSearchesEl = document.querySelector('#city-buttons');
var cityInputEl = document.querySelector('#city-input');
var resultsContainerEl = document.querySelector('#results');

var loadCities = function() {
    var lastSearch = localStorage.getItem('last-search');
    // If a search has been performed in this browser
    if (lastSearch) {
        var citiesArray = localStorage.getItem('citiesArray');
        // And if a citiesArray exists in local storage
        if (citiesArray) {
            // Create buttons for the citiesArray
            citiesArray = JSON.parse(citiesArray);
            var existingButton;
            // If the last search made is not an existing button, add to the citiesArray
            for (var i = 0; i < citiesArray.length; i++) {
                if (citiesArray[i] === lastSearch) {
                    existingButton = citiesArray[i];
                    break;
                }
            }
            if (!existingButton) {
                citiesArray.push(lastSearch)
            }
        // If a citiesArray does NOT yet exist in local storage, create an array and add the last search
        } else { 
            citiesArray = [];
            citiesArray.push(lastSearch)
        }
        // Updated citiesArray stored in localStorage
        localStorage.setItem('citiesArray', JSON.stringify(citiesArray));
        // Clear previous search buttons
        previousSearchesEl.textContent = '';
        // Add back buttons for updated array
        for (var i = 0; i < citiesArray.length; i++) {
            var cityBtn = document.createElement('button');
            cityBtn.textContent = citiesArray[i];
            cityBtn.classList = 'btn previous-search';

            previousSearchesEl.appendChild(cityBtn);
        }
    }
}

// When search button is clicked
var formSubmitHandler = function(event) {
    event.preventDefault();
    var city = cityInputEl.value.trim();
    if (city) {
        getLatLon(city);
        cityInputEl.value = '';
    } else {
        alert('Please enter the name of a city');
    }
};

// When a previous search button is clicked
var buttonClickHandler = function(event) {
    if (event.target.type === 'submit') {
        var city = event.target.textContent;
        getLatLon(city);
        cityInputEl.textContent = '';
    }
}

// Get the latitude and longitude of each city and pass into the argument for getWeather()
var getLatLon = function(city) {
    var apiKey = '0ea17125ef15498e647e96299b01656d';
    var apiUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&units=imperial&appid=' + apiKey;
    fetch(apiUrl)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    localStorage.setItem('last-search', data.name)
                    loadCities();
                    var city = data.name;
                    var lat = data.coord.lat;
                    var lon = data.coord.lon;
                    getWeather(lat, lon, city);
                });
            } else {
                alert('Error: City Not Found');
            }
        })
        .catch(function(error) {
            alert('Unable to connect: The weatherman is off duty!');
    });
};

// Get weather data for the current day and 5-Day Forecast
var getWeather = function(lat, lon, city) {
    var apiKey = '0ea17125ef15498e647e96299b01656d';
    var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&exclude=minutely,hourly,alerts&units=imperial&appid=' + apiKey;
    fetch(apiUrl)
        .then(function(response) {
            response.json().then(function(data) {
                var current = data.current;
                var daily = data.daily;
                displayCurrentWeather(current, city)
                displayForecast(daily);
                });
    });
};

var displayCurrentWeather = function(data, city) {
    console.log(data);
    // Clear previous results
    resultsContainerEl.textContent = '';
    
    // Create a container for current weather
    var currentWeatherEl = document.createElement('article');
    currentWeatherEl.id = 'current';
    currentWeatherEl.classList = 'p-10';

    // Create header2 with name & date
    var header2El = document.createElement('header2');
    header2El.id = 'city-name';
    var today = new Date();
    var date = (today.getMonth() + 1) + '/' + 
        today.getDate() + '/' + 
        today.getFullYear();
    header2El.textContent = city + ' (' + date + ')  ';

    // Create weather icon to the right of header2
    var icon = data.weather[0].icon;
    var imgEl = document.createElement('img')
    imgEl.classList = 'absolute-position';
    imgEl.setAttribute('src', 'http://openweathermap.org/img/w/' + icon + '.png')

    // Create paragraphs for temperature, wind, humidity & uvi
    var tempEl = document.createElement('p')
    tempEl.innerHTML = 'Temp: ' + data.temp + '<span>&#176;</span>F';
    tempEl.classList = 'p-20-0-10-0';

    var windEl = document.createElement('p')
    windEl.textContent = 'Wind: ' + data.wind_speed + ' MPH';
    windEl.classList = 'p-10-0';

    var humidityEl = document.createElement('p')
    humidityEl.textContent = 'Humidity: ' + data.humidity + ' %';
    humidityEl.classList = 'p-10-0';

    var uvIndexEl = document.createElement('p')
    uvIndexEl.innerHTML = "UV Index: <span id='uvi'>" + data.uvi + '</span>';
    uvIndexEl.classList = 'p-10-0';

    // Append elements to current weather section
    currentWeatherEl.appendChild(header2El);
    currentWeatherEl.appendChild(imgEl);
    currentWeatherEl.appendChild(tempEl);
    currentWeatherEl.appendChild(windEl);
    currentWeatherEl.appendChild(humidityEl);
    currentWeatherEl.appendChild(uvIndexEl);

    // Append current weather section to results div
    resultsContainerEl.appendChild(currentWeatherEl);

    // Dynamically update color to reflect severity of the UV Index
    var uviColorEl = document.querySelector('#uvi');
    if (parseInt(data.uvi) < 3) {
        uviColorEl.classList = 'favorable';
    } else if (parseInt(data.uvi) > 8) {
        uviColorEl.classList = 'severe';
    } else {
        uviColorEl.classList = 'moderate';
    }
}

var displayForecast = function(data) {
    console.log(data);
    // Create a container for forecast
    var forecastEl = document.createElement('div');

    var h3El = document.createElement('h3');
    h3El.textContent = '5-Day Forecast:';
    h3El.classList = 'p-20-0-10-0';

    var daysContainerEl = document.createElement('div');
    daysContainerEl.classList = 'row space-between'

    for (var i = 1; i < 6; i++) {
        var singleDayEl = document.createElement('article');
        singleDayEl.classList = 'col-5 col-xl-2 p-10 dark-bg mb-20';

        // Add date at the top of each card
        var x = new Date(data[i].dt * 1000);
        var date = (x.getMonth() + 1) + '/' + 
            x.getDate() + '/' + 
            x.getFullYear(); 
        var h4El = document.createElement('h4');
        h4El.textContent = date;
        h4El.classList = 'white-font';

        // Add weather icon
        var icon = data[i].weather[0].icon;
        var imgEl = document.createElement('img')
        imgEl.setAttribute('src', 'http://openweathermap.org/img/w/' + icon + '.png')
        
        // Create paragraphs for temperature, wind, humidity & uvi
        var tempEl = document.createElement('p')
        tempEl.innerHTML = 'Temp: ' + data[i].temp.day + ' <span>&#176;</span>F';
        tempEl.classList = 'p-10-0 white-font lg-font-size';

        var windEl = document.createElement('p')
        windEl.textContent = 'Wind: ' + data[i].wind_speed + ' MPH';
        windEl.classList = 'p-10-0 white-font lg-font-size';

        var humidityEl = document.createElement('p')
        humidityEl.textContent = 'Humidity: ' + data[i].humidity + ' %';
        humidityEl.classList = 'p-10-0 white-font lg-font-size';

        singleDayEl.appendChild(h4El);
        singleDayEl.appendChild(imgEl);
        singleDayEl.appendChild(tempEl);
        singleDayEl.appendChild(windEl);
        singleDayEl.appendChild(humidityEl);

        daysContainerEl.appendChild(singleDayEl);
    }

    // Append elements to current weather section
    forecastEl.appendChild(h3El);
    forecastEl.appendChild(daysContainerEl);
    
    // Append current weather section to results div
    resultsContainerEl.appendChild(forecastEl);
}

// Load buttons from previous search history on load page
loadCities();
searchFormEl.addEventListener('submit', formSubmitHandler);
previousSearchesEl.addEventListener('click', buttonClickHandler);
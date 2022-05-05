//api key
var apiKey = "eb7b907aaf0cbad063ad71c08ba628dc";

//today's date
var date = moment().format("MM/DD/YYYY");

//submit button
var submitButtonEl = document.querySelector("#submit-btn");

//event listener for submit button
submitButtonEl.addEventListener("click", function (event) {
  event.preventDefault();

  //get cityname from search input value
  var cityName = document.querySelector("#city-input").value.trim();
  console.log(cityName);

  displayTodaysWeather(cityName);
  saveCity(cityName);
});


//function to display todays weather
function displayTodaysWeather(cityName) {
  var todaysWeatherEl = document.querySelector("#todays-weather");
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${apiKey}`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      todaysWeatherEl.innerHTML = `
        <h3>${data.name} (${date})</h3>
        <p>Temperature: ${data.main.temp} F </p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} mph</p>
        
       `;
      console.log(data);

      var lat = data.coord.lat;
      var lon = data.coord.lon;
 
      fiveDayDisplay(lat, lon);
      //need to fetch call a different API to get the UI index, this API uses lat and long rather than city name
      fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${apiKey}`
      )
        .then(function (response) {
          return response.json();
        })
        .then(function (data2) {
          // var indexEl = document.querySelector("#uv-index");
          todaysWeatherEl.innerHTML += `<p>UV Index: ${data2.current.uvi}</p>`;
        });
    });
}

//function to display 5 day weather
function fiveDayDisplay(lat, lon) {
  fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=imperial&appid=${apiKey}`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      document.querySelector("#week-weather").innerHTML = "";
      for (var i = 1; i < 6; i++) {
        //use inner html to display 5 day forecast
        document.querySelector("#week-weather").innerHTML += `
            <div class="card text-white bg-primary mb-3" style="max-width: 18rem;">
              <div class="card-header">${moment
                .unix(data.daily[i].dt)
                .format("MM/DD/YYYY")} </div>
              <div class="card-body">
              <h5 class="card-title"><img src="http://openweathermap.org/img/wn/${
                data.daily[i].weather[0].icon
              }@2x.png" /> </h5>
              <p class= "card-text"> Temp: ${data.daily[i].temp.day}</p>
              <p class= "card-text"> Humidity: ${data.daily[i].humidity}</p>
                </div>
              `;
      }
    });
}

function loadCities() {
  document.querySelector("#city-list").innerHTML = "";
  //parse into an array and save that value into a variable
  var cityArray = JSON.parse(localStorage.getItem("cities"));

  cityArray.forEach((city)=> {
     document.querySelector("#city-list").innerHTML += `<li class="list-group-item city-item">${city}</li>`
  }) 
  //add city to the list
  document.querySelectorAll(".city-item").forEach((city) => {
    //add event listener, for each item in the array, when you click event function happens
      city.addEventListener("click", function (event) {
        event.preventDefault();
        //get cityname from search input value
        var cityName = this.textContent
        //call the function that displays the weather data
        displayTodaysWeather(cityName);
      });
  })
}

function saveCity(cityName) {
  //if statement to check if there is local storge
  //create local storage with empty array
  if (!localStorage.getItem("cities")) {
    localStorage.setItem("cities", JSON.stringify([]));
  }
  //take of value of the city input
  var cityArray = JSON.parse(localStorage.getItem("cities"));
  cityArray.push(cityName);

  //save back to local storage
  localStorage.setItem("cities", JSON.stringify(cityArray));
  loadCities();
}

loadCities();
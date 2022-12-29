const axios = require('axios');
require('dotenv').config();

function displayForecast(forecast) {
  const { data, dates } = forecast;

  return `The weather forecast for the next 5 days in ${data[0].city} from NotifyMe-US:
  ${dates[0].toLocaleDateString()}: ${data[0].temp} °F with ${data[0].weather}
  ${dates[1].toLocaleDateString()}: ${data[1].temp} °F with ${data[1].weather}
  ${dates[2].toLocaleDateString()}: ${data[2].temp} °F with ${data[2].weather}
  ${dates[3].toLocaleDateString()}: ${data[3].temp} °F with ${data[3].weather}
  ${dates[4].toLocaleDateString()}: ${data[4].temp} °F with ${data[4].weather}`;
}

const getCurrentWeather = async (zip) => {
  try {
    const API_KEY = process.env.WEATHER_KEY;
    let token = process.env.MAPBOX_TOKEN;

    const latLon = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/postcode/${zip}.json?access_token=${token}&country=us`);

    let lat = latLon.data.features[0].center[1];
    let lon = latLon.data.features[0].center[0];

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);

    const forecast = response.data;
    const temperatureHigh = forecast.main.temp_max;
    const fahrenheitHigh = (temperatureHigh - 273.15) * 9 / 5 + 32;
    const temperatureLow = forecast.main.temp_min;
    const fahrenheitLow = (temperatureLow - 273.15) * 9 / 5 + 32;
    const windspeed = forecast.wind.speed;
    const windMph = windspeed * 2.236936;

    const output = {
      town: forecast.name,
      weather: forecast.weather[0].description,
      fahrenheitRoundedHigh: Math.round(fahrenheitHigh * 100) / 100,
      fahrenheitRoundedLow: Math.round(fahrenheitLow * 100) / 100,
      humidity: forecast.main.humidity,
      windMphFormatted: windMph.toFixed(2),
      cloudCoverage: forecast.clouds.all,
    };

    return output;
  } catch (error) {
    console.error(error);
    throw 'An error has occured with your request (current)';
  }
};

function displayCurrent(output) {
  const { town, weather, fahrenheitRoundedHigh, fahrenheitRoundedLow, humidity, windMphFormatted, cloudCoverage } = output;

  return `The weather in ${town} is currently ${weather}. The high temperature for today will be ${fahrenheitRoundedHigh} degrees Fahrenheit, and the low temperature will be ${fahrenheitRoundedLow} degrees Fahrenheit. The humidity will be ${humidity}%, and the wind speed will be ${windMphFormatted} mph. There will be ${cloudCoverage}% cloud coverage." `;
}


const getForecast = async (zip) => {
  try {
    const API_KEY = process.env.WEATHER_KEY;
    let token = process.env.MAPBOX_TOKEN;


    const latLon = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/postcode/${zip}.json?access_token=${token}&country=us`);

    let lat = latLon.data.features[0].center[1];
    let lon = latLon.data.features[0].center[0];

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`,
    );

    const getForecastData = function (dayIndex) {
      const forecast = response.data.list[dayIndex];
      const weather = forecast.weather[0].description;
      const temperature = forecast.main.temp;
      const fahrenheit = (temperature - 273.15) * 9 / 5 + 32;
      const fahrenheitRounded = Math.round(fahrenheit * 100) / 100;
      const town = response.data.city.name;
      return {
        weather: weather,
        temp: fahrenheitRounded,
        city: town,
      };
    };

    const forecast = {
      data: [],
      dates: [],
    };

    for (let i = 0; i < 5; i++) {
      let j = i * 8 + 4;
      forecast.data[i] = getForecastData(j);
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + i);
      forecast.dates[i] = forecastDate;
    }
    return forecast;

  } catch (error) {
    console.error(error);
    throw 'An error has occured with your request (forecast)';
  }
};

const displayTraffic = function(traffic) {
  const {duration, totalDistance, listRoute} = traffic;

  return `Your Daily Commute from NotifyMe-US for ${new Date().toLocaleDateString()}
  Total distance: ${totalDistance} miles
  Total duration: ${duration} minutes,

  Best Route:
  ${listRoute}`;
};


const getTraffic = async (firstAddress, secondAddress) => {
  let token = process.env.MAPBOX_TOKEN;

  let addressOne = encodeURIComponent(firstAddress);
  let addressTwo = encodeURIComponent(secondAddress);

  try {

    const latLonOne = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/address/${addressOne}.json?types=address%2Cplace&access_token=${token}&country=us`);

    const latLonTwo = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/address/${addressTwo}.json?access_token=${token}&country=us`);

    let addressOneCoor = latLonOne.data.features[0].center;
    let addressTwoCoor = latLonTwo.data.features[0].center;
    let coordinates = `${addressOneCoor[0]},${addressOneCoor[1]};${addressTwoCoor[0]},${addressTwoCoor[1]}`;

    const response = await axios.get(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinates}?geometries=polyline&overview=simplified&steps=true&access_token=${token}`);

    const directions = response.data;
    const step = directions.routes[0].legs[0].steps;

    const instructionsAndDistance = step.map(step => ({
      instruction: step.maneuver.instruction,
      distance: parseFloat((step.distance / 1609.344).toFixed(2)),
    }));

    const instructions = instructionsAndDistance.map(step => `${step.instruction} (${step.distance} miles)`).join('\n');
    const distance = instructionsAndDistance.reduce((acc, step) => acc + step.distance, 0);
    const roundedDistance = distance.toFixed(2);
    const duration = Math.ceil(directions.routes[0].duration / 60);

    const traffic = {
      duration: duration,
      totalDistance: roundedDistance,
      listRoute: instructions,
    };
    return traffic;

  } catch (error) {
    console.error(error);

  }
};


const getEvents = async (cityName, state) => {
  try {
    const currentDate = new Date();
    const startDateTime = currentDate.toISOString().slice(0, -5) + 'Z';

    const endDateTime = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, -5) + 'Z';
    console.log(startDateTime);
    console.log(endDateTime);

    let apikey = process.env.TICKET_API;
    let city = cityName;
    let stateCode = state;
    let radius = '20';
    let unit = 'miles';

    const response = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/events.json?size=5&apikey=${apikey}&startDateTime=${startDateTime}&endDateTime=${endDateTime}&city=${city}&radius=${radius}&unit=${unit}&stateCode=${stateCode}`);

    const concerts = response.data;


    const toStandardTime = function (time) {

      const [hours, minutes, seconds] = time.split(':');
      let hoursFix = parseInt(hours, 10);
      let minutesFix = parseInt(minutes, 10);
      let secondsFix = parseInt(seconds, 10);

      if (hoursFix >= 12) {

        hoursFix -= 12;

        time = `${hoursFix.toString().padStart(2, '0')}:${minutesFix
          .toString()
          .padStart(2, '0')}:${secondsFix.toString().padStart(2, '0')} PM`;
      } else {

        time = `${hoursFix.toString().padStart(2, '0')}:${minutesFix
          .toString()
          .padStart(2, '0')}:${secondsFix.toString().padStart(2, '0')} AM`;
      }

      return time;
    };

    let eventList = '';
    for (let i = 0; i < 5; i++) {
      const venueData = concerts._embedded.events[i];
      const venue = venueData._embedded.venues[0].name;
      const eventName = concerts._embedded.events[i].name;
      const eventUrl = concerts._embedded.events[i].url;
      const eventDate = concerts._embedded.events[i].dates;
      const eventStartTime = eventDate.start.localTime;
      const eventStartDate = eventDate.start.localDate;
      const newTime = toStandardTime(eventStartTime);

      eventList += `${eventName} at ${venue} on ${eventStartDate} at ${newTime}, Link: ${eventUrl}`;
    }

    return eventList;
  } catch (error) {
    console.error(error);
  }
};


module.exports = {
  getCurrentWeather,
  getForecast,
  displayForecast,
  getTraffic,
  displayTraffic,
  getEvents,
  displayCurrent,
};

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

module.exports = {
  getCurrentWeather,
  getForecast,
  displayForecast,
};

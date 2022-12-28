

const router = require('express').Router();
const axios = require('axios');
const Mailgun = require('mailgun-js');

require('dotenv').config();
const mailgun = new Mailgun({
  apiKey: process.env.MAILGUN_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const getForecast = socket => ( async () => {

  let zip = '60513';

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

    const forecastData1 = getForecastData(4);
    const forecastData2 = getForecastData(12);
    const forecastData3 = getForecastData(20);
    const forecastData4 = getForecastData(28);
    const forecastData5 = getForecastData(36);


    const currentDate = new Date();
    const forecastDates = [];

    for (let i = 0; i < 5; i++) {
      const forecastDate = new Date(currentDate);
      forecastDate.setDate(currentDate.getDate() + i);
      forecastDates.push(forecastDate);
    }

    console.log(response.data);



    const msg = {
      to: 'steveo732@gmail.com',
      from: 'notifyme.us@gmail.com',
      subject: 'Your 5 Day Weather Forecast',
      text: `The weather forecast for the next 5 days in ${forecastData1.city} from NotifyMe-US:
      ${forecastDates[0].toLocaleDateString()}: ${forecastData1.temp} °F with ${forecastData1.weather}
      ${forecastDates[1].toLocaleDateString()}: ${forecastData2.temp} °F with ${forecastData2.weather}
      ${forecastDates[2].toLocaleDateString()}: ${forecastData3.temp} °F with ${forecastData3.weather}
      ${forecastDates[3].toLocaleDateString()}: ${forecastData4.temp} °F with ${forecastData4.weather}
      ${forecastDates[4].toLocaleDateString()}: ${forecastData5.temp} °F with ${forecastData5.weather}
    `,
      html: `<p>The weather forecast for the next 5 days in ${forecastData1.city} from NotifyMe-US:
      <ul>
      <li>
       ${forecastDates[0].toLocaleDateString()}: ${forecastData1.temp} °F with ${forecastData1.weather}</li>
      <li>
       ${forecastDates[1].toLocaleDateString()}: ${forecastData2.temp} °F with ${forecastData2.weather}</li>
      <li>
       ${forecastDates[2].toLocaleDateString()}: ${forecastData3.temp} °F with ${forecastData3.weather}</li>
      <li>
       ${forecastDates[3].toLocaleDateString()}: ${forecastData4.temp} °F with ${forecastData4.weather}</li>
      <li>
       ${forecastDates[4].toLocaleDateString()}: ${forecastData5.temp} °F with ${forecastData5.weather}</li>
      </ul>
      </p>`,
    };


    mailgun.messages().send(msg, (error, body) => {
      if (error) {
        console.error(error);
        socket.emit('API_ERROR', 'An error has occured with your request');
      } else {
        res.send({ message: 'Email sent successfully', msg });
        console.log(msg.text);
      }
    });

  } catch (error) {
    console.error(error);
    socket.emit('API_ERROR', 'An error has occured with your request');
  }
});


const getWeather = socket => (async () => {

  let zip = '60513';
  try {

    const API_KEY = process.env.WEATHER_KEY;
    let token = process.env.MAPBOX_TOKEN;


    const latLon = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/postcode/${zip}.json?access_token=${token}&country=us`);


    let lat = latLon.data.features[0].center[1];
    let lon = latLon.data.features[0].center[0];

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);


    const forecast = response.data;
    const weather = forecast.weather[0].description;
    const temperatureHigh = forecast.main.temp_max;
    const fahrenheitHigh = (temperatureHigh - 273.15) * 9 / 5 + 32;
    const fahrenheitRoundedHigh = Math.round(fahrenheitHigh * 100) / 100;
    const temperatureLow = forecast.main.temp_min;
    const fahrenheitLow = (temperatureLow - 273.15) * 9 / 5 + 32;
    const fahrenheitRoundedLow = Math.round(fahrenheitLow * 100) / 100;
    const humidity = forecast.main.humidity;
    const windspeed = forecast.wind.speed;
    const windMph = windspeed * 2.236936;
    const windMphFormatted = windMph.toFixed(2);
    const cloudCoverage = forecast.clouds.all;
    const town = forecast.name;

    const msg = {
      to: 'steveo732@gmail.com',
      from: 'notifyme.us@gmail.com',
      subject: 'Your Daily Weather Forecast',
      text: `"Here is your custom weather forecast for today from NotifyMe-US:

      The weather in ${town} is currently ${weather}. The high temperature for today will be ${fahrenheitRoundedHigh} degrees Fahrenheit, and the low temperature will be ${fahrenheitRoundedLow} degrees Fahrenheit. The humidity will be ${humidity}%, and the wind speed will be ${windMphFormatted} mph. There will be ${cloudCoverage}% cloud coverage."`,


      html: `<p>
      Here is your custom weather forecast for today from NotifyMe-US::
      <ul>
      <li>
      The weather in ${town} is currently ${weather}. The high temperature for today will be ${fahrenheitRoundedHigh} degrees Fahrenheit, and the low temperature will be ${fahrenheitRoundedLow} degrees Fahrenheit.</li>
      <li>
       The humidity will be ${humidity}%, and the wind speed will be ${windMphFormatted} mph. There will be ${cloudCoverage}% cloud coverage.
       </li>
       </ul>
       </p>`,
    };

    mailgun.messages().send(msg, (error, body) => {
      if (error) {
        console.error(error);
        socket.emit('API_ERROR', 'An error has occured with your request');
      } else {
        console.log(msg.text);

        res.send({ message: 'Email sent successfully', msg });
      }
    });

  } catch (error) {
    console.error(error);
    socket.emit('API_ERROR', 'An error has occured with your request');
  }
});


const getDirections = socket => ( async () => {
  let token = process.env.MAPBOX_TOKEN;

  let addressOne = encodeURIComponent('4026 sunnyside ave 60513');
  let addressTwo = encodeURIComponent('4255 N Knox Ave 60641');

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

    const msg = {
      to: 'steveo732@gmail.com',
      from: 'notifyme.us@gmail.com',
      subject: 'Your Daily Commute from NotifyMe-US',
      text: `Your Daily Commute from NotifyMe-US for ${new Date().toLocaleDateString()}
      Total distance: ${roundedDistance} miles
      Total duration: ${duration} minutes,

      Best Route:
      ${instructions}`,

      html: `<p>Your Daily Commute from NotifyMe-US for ${new Date().toLocaleDateString()}</p>
      <p>Total distance: ${roundedDistance} miles</p>
      <p>Total duration: ${duration} minutes</p>
      <p>Best Route:</p>

      <ol>
      ${instructionsAndDistance.map(step => `<li>${step.instruction} (${step.distance} miles)</li>`).join('')}
      </ol>
      `,

    };



    mailgun.messages().send(msg, (error, body) => {
      if (error) {
        console.error(error);
        socket.emit('API_ERROR', 'An error has occured with your request');
      } else {
        console.log(msg.text);
        res.send({ message: 'Email sent successfully', msg });

      }
    });
  } catch (error) {
    console.error(error);
    socket.emit('API_ERROR', 'An error has occured with your request');
  }
});

const getEvents = socket => ( async () => {
  try {

    const currentDate = new Date();
    const startDateTime = currentDate.toISOString().slice(0, -5) + 'Z';

    const endDateTime = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, -5) + 'Z';
    console.log(startDateTime);
    console.log(endDateTime);


    let apikey = process.env.TICKET_API;
    let city = 'seattle';
    let stateCode = 'wa';
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

      eventList += `<li>${eventName} at ${venue} on ${eventStartDate} at ${newTime}, Link: ${eventUrl}</li>`;
    }

    const msg = {
      to: 'steveo732@gmail.com',
      from: 'notifyme.us@gmail.com',
      subject: 'Check Out These 5 events happening this week!',
      text: `Five Upcoming Events in your Area: ${eventList}`,
      html: `<p>Five Upcoming Events in your Area:</p>
             <ul>
               ${eventList}
             </ul>`,
    };

    mailgun.messages().send(msg, (error, body) => {
      if (error) {
        console.error(error);
        socket.emit('API_ERROR', 'An error has occured with your request');
      } else {
        console.log(msg.text);
        socket.emit('API_RESULT', 'success'); // TODO - replace 'success' with actual api result
      }
    });
  } catch (error) {
    console.error(error);
    socket.emit('API_ERROR', 'An error has occured with your request');
  }
});

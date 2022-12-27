

const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');


const Mailgun = require('mailgun-js');
const mailgun = new Mailgun({ apiKey: process.env.MAILGUN_KEY, domain: process.env.MAILGUN_DOMAIN });


dotenv.config();

// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey();


const app = express();


app.get('/forecast', async (req, res) => {

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

    const getForecastData = function(dayIndex) {
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

    console.log(response.data.city.name);
    console.log(forecastData1);



    const msg = {
      to: 'steveo732@gmail.com',
      from: 'notifyme.us@gmail.com',
      subject: 'Your 5 Day Weather Forecast',
      text: `The weather forecast for the next 5 days in ${forecastData1.city} from NotifyMe-US:
      Day 1: ${forecastData1.temp} °F with ${forecastData1.weather}
      Day 2: ${forecastData2.temp} °F with ${forecastData2.weather}
      Day 3: ${forecastData3.temp} °F with ${forecastData3.weather}
      Day 4: ${forecastData4.temp} °F with ${forecastData4.weather}
      Day 5: ${forecastData5.temp} °F with ${forecastData5.weather}
    `,
      html: `<p>The weather forecast for the next 5 days in ${forecastData1.city} from NotifyMe-US:
      <ul>
      <li>
      Day 1: ${forecastData1.temp} °F with ${forecastData1.weather}</li>
      <li>
      Day 2: ${forecastData2.temp} °F with ${forecastData2.weather}</li>
      <li>
      Day 3: ${forecastData3.temp} °F with ${forecastData3.weather}</li>
      <li>
      Day 4: ${forecastData4.temp} °F with ${forecastData4.weather}</li>
      <li>
      Day 5: ${forecastData5.temp} °F with ${forecastData5.weather}</li>
      </ul>
      </p>`,
    };


    mailgun.messages().send(msg, (error, body) => {
      if (error) {
        console.error(error);
        res.status(500).send({ message: 'An error occurred' });
      } else {
        res.send({ message: 'Email sent successfully', msg });
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An error occurred' });
  }
});


app.get('/current', async (req, res) => {

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
      Here is your custom weather forecast for today NotifyMe-US:
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
        res.status(500).send({ message: 'An error occurred' });
      } else {
        console.log(msg);

        res.send({ message: 'Email sent successfully', msg });
      }
    });



  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An error occurred' });
  }
});




app.get('/directions', async (req, res) => {
  let token = process.env.MAPBOX_TOKEN;

  let addressOne = encodeURIComponent('4026 sunnyside ave 60513');
  let addressTwo = encodeURIComponent('4255 N Knox Ave 60641');

  try {

    const latLonOne = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/address/${addressOne}.json?types=address%2Cplace&access_token=${token}&country=us`);


    const latLonTwo = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/address/${addressTwo}.json?access_token=${token}&country=us`);



    let addressOneCoor = latLonOne.data.features[0].center;
    let addressTwoCoor = latLonTwo.data.features[0].center;

    let coordinates = `${addressOneCoor[0]},${addressOneCoor[1]};${addressTwoCoor[0]},${addressTwoCoor[1]}`;



    const response = await axios.get(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinates}?geometries=geojson&overview=simplified&steps=true&access_token=${token}`);

    const directions = response.data;


    console.log(directions.routes[0].legs[0].steps);
    res.send({ message: 'Directions retrieved successfully', directions });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An error occurred' });
  }
});


app.get('/concerts', async (req, res) => {
  try {

    const currentDate = new Date();
    const startDateTime = currentDate.toISOString().slice(0, -5) + 'Z';

    const endDateTime = new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, -5) + 'Z';
    console.log(startDateTime);
    console.log(endDateTime);


    let apikey = process.env.TICKET_API;
    let city = 'brookfield';
    let stateCode = 'IL';
    let radius = '60';
    let unit = 'miles';


    const response = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/events.json?size=5&apikey=${apikey}&startDateTime=${startDateTime}&endDateTime=${endDateTime}&city=${city}&radius=${radius}&unit=${unit}&stateCode=${stateCode}`);

    const concerts = response.data;

    console.log(concerts);
    res.send({ message: 'Concerts retrieved successfully', concerts });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An error occurred' });
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

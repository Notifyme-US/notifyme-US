require('dotenv').config();

const axios = require('axios');
const Mailgun = require('mailgun.js');
const formData = require('form-data');
const { Sequelize, DataTypes } = require('sequelize');

const DATABASE_URL = process.env.DATABASE_URL;
const db = new Sequelize(DATABASE_URL);

const subs = db.define('Subscriptions', {
  username: {
    type: DataTypes.STRING,
    required: true,
  },
  type: {
    type: DataTypes.ENUM(['weather', 'events']),
    required: true,
  },
});

const users = db.define('Users', {
  username: {
    type: DataTypes.STRING,
    required: true,
    primaryKey: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    required: true,
  },
  role: {
    type: DataTypes.STRING,
    required: true,
  },
  name: {
    type: DataTypes.STRING,
    required: false,
  },
  phone: {
    type: DataTypes.STRING,
    required: true,
  },
  email: {
    type: DataTypes.STRING,
    required: true,
  },
  zip: {
    type: DataTypes.STRING,
    required: true,
  },
});

users.hasMany(subs, {
  foreignKey: 'username',
});
subs.belongsTo(users, {
  foreignKey: 'username',
});

const mailgun = new Mailgun(formData);
const client = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_KEY,
});

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

async function mailgunForecast(current, forecast, email) {
  const { data, dates } = forecast;

  const msg = {
    to: email,
    from: 'notifyme.us@gmail.com',
    subject: 'Your Daily Weather Summary',
    html: `<div>
    <p>
      Here is your custom weather forecast for ${current.town} from NotifyMe-US:
      <ul>
        <li>
          The weather is currently ${current.weather}. The high temperature for today will be ${current.fahrenheitRoundedHigh} degrees Fahrenheit, and the low temperature will be ${current.fahrenheitRoundedLow} degrees Fahrenheit.
        </li>
        <li>
          The humidity will be ${current.humidity}%, and the wind speed will be ${current.windMphFormatted} mph. There will be ${current.cloudCoverage}% cloud coverage.
        </li>
      </ul>
    </p>

    <p>
      The weather forecast for the next 5 days:
      <ul>
        <li>
          ${dates[0].toLocaleDateString()}: ${data[0].temp} °F with ${data[0].weather}
        </li>
        <li>
          ${dates[1].toLocaleDateString()}: ${data[1].temp} °F with ${data[1].weather}
        </li>
        <li>
          ${dates[2].toLocaleDateString()}: ${data[2].temp} °F with ${data[2].weather}
        </li>
        <li>
          ${dates[3].toLocaleDateString()}: ${data[3].temp} °F with ${data[3].weather}
        </li>
        <li>
          ${dates[4].toLocaleDateString()}: ${data[4].temp} °F with ${data[4].weather}
        </li>
      </ul>
    </p>
    </div>`,
  };


  await client.messages.create(process.env.MAILGUN_DOMAIN, msg);
  console.log('completed mailgun send');
}


exports.handler = async () => {
  const subsList = await subs.findAll({
    where: {
      type: 'weather',
    },
    include: [{
      model: users,
      required: true,
    }],
  });
  console.log(subsList);

  await Promise.allSettled(subsList.map(async sub => {
    try {
      console.log('THIS IS SUB -------------', sub.User.dataValues);
      const { zip, email } = sub.User.dataValues;
      const currentWeather = await getCurrentWeather(zip);
      const forecast = await getForecast(zip);
      await mailgunForecast(currentWeather, forecast, email);
      console.log(`----- SUCCESS sending weather summary to ${email} -----`);
    } catch(e) {
      console.log(e.message);
    }
  }));
  console.log(`----- SUCCESS -----`);

};

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

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
  city: {
    type: DataTypes.STRING,
    required: true,
  },
  state: {
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

async function getEvents(city, stateCode) {
  try {

    const currentDate = new Date();
    const startDateTime = currentDate.toISOString().slice(0, -5) + 'Z';

    const endDateTime = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, -5) + 'Z';
    console.log(startDateTime);
    console.log(endDateTime);


    let apikey = process.env.TICKET_API;
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
    return eventList;
  } catch (error) {
    console.error(error);
  }
}

async function mailgunEvents(eventList, email) {

  const msg = {
    to: email,
    from: 'notifyme.us@gmail.com',
    subject: 'Check Out These 5 events happening this week!',
    html: `<p>Five Upcoming Events in your Area:</p>
    <ul>
      ${eventList}
    </ul>`,
  };

  await client.messages.create(process.env.MAILGUN_DOMAIN, msg);
  console.log('completed mailgun send');
}


exports.handler = async () => {
  const subsList = await subs.findAll({
    where: {
      type: 'events',
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
      const { city, state, email } = sub.User.dataValues;

      const eventList = await getEvents(city, state);
      await mailgunEvents( eventList, email);
      console.log(`----- SUCCESS sending events summary to ${email} -----`);
    } catch (e) {
      console.log(e.message);
    }
  }));
  console.log(`----- SUCCESS -----`);

};

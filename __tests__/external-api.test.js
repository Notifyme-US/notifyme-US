'use strict';

const { getCurrentWeather, getForecast, getTraffic, getEvents, displayCurrent, displayForecast, displayTraffic } = require('../server/external-api');

let current, forecast, traffic;

describe('Get current weather', () => {
  it('handles standard call with zip', async () => {
    current = await getCurrentWeather('98101');
    console.log('🚀 ~ file: external-api.test.js:10 ~ it ~ current', current);
    const keys = Object.keys(current);
    const expectedKeys = ['town', 'weather', 'fahrenheitRoundedHigh', 'fahrenheitRoundedLow', 'humidity', 'windMphFormatted', 'cloudCoverage'];
    expect(keys).toEqual(expect.arrayContaining(expectedKeys));
  });
});

describe('Get 5-day forecast', () => {
  it('handles standard call with zip', async () => {
    forecast = await getForecast('98101');
    console.log('🚀 ~ file: external-api.test.js:17 ~ it ~ forecast', forecast);
    const keys = Object.keys(forecast);
    const expectedKeys = ['data', 'dates'];
    expect(keys).toEqual(expect.arrayContaining(expectedKeys));
    expect(forecast.data.length).toEqual(5);
  });
});

describe('Get events', () => {
  it('handles standard call with city/state', async () => {
    const events = await getEvents('seattle', 'wa');
    expect(typeof events).toEqual('string');
  });
});

describe('Get traffic', () => {
  it('handles standard call with landmarks', async () => {
    traffic = await getTraffic('space_needle', 'pike_place_market');
    console.log('🚀 ~ file: external-api.test.js:33 ~ it ~ traffic', traffic);
    const keys = Object.keys(traffic);
    const expectedKeys = ['duration', 'totalDistance', 'listRoute'];
    expect(keys).toEqual(expect.arrayContaining(expectedKeys));
  });
});

describe('Displays current weather', () => {
  it('transforms api return object into a string', async () => {
    const output = displayCurrent(current);
    console.log('🚀 ~ file: external-api.test.js:41 ~ it ~ output', output);
    expect(typeof output).toEqual('string');
  });
});

describe('Displays 5-day forecast', () => {
  it('transforms api return object into a string', async () => {
    const output = displayForecast(forecast);
    expect(typeof output).toEqual('string');
  });
});

describe('Displays traffic', () => {
  it('transforms api return object into a string', async () => {
    const output = displayTraffic(traffic, {
      firstAddress: 'space_needle',
      secondAddress: 'pike_place_market',
    });
    expect(typeof output).toEqual('string');
  });
});

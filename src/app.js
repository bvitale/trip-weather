const fs = require('fs');
const moment = require('moment');
const stops = JSON.parse(fs.readFileSync(__dirname + '/stops.json'));
const request = require('request-promise-native');
const express = require('express');

const app = express();
app.set('view engine', 'pug');

async function getPredictions() {
  const results = [];
  for (let stop of stops) {
    const prediction = {
      date: moment(stop.date).format('ddd, MMM D'),
      location: stop.name,
      summary: `No prediction yet`
    };
    const stopDate = moment(stop.date);
    if (stopDate.diff(moment(), 'days') < 0) {
      console.log(`skipping ${stopDate.format()}, date is past`);
      continue;
    }
    if (stopDate.diff(moment(), 'days') >= 7) {
      console.log(`skipping ${stopDate.format()}, date is more than 7 days out`);
      results.push(prediction);
      continue;
    }
    console.log(`Requesting prediction for ${prediction.location} on ${prediction.date}`);
    const options = {
      uri: `https://api.darksky.net/forecast/${process.env.API_KEY}/${stop.gps}?exclude=currently,hourly,minutely`,
      json: true
    };
    const response = await request(options);
    response.daily.data.forEach(day => {
      const date = moment.unix(day.time);
      if (date.isSame(stopDate, 'day')) {
        prediction.summary = day.summary;
        prediction.temp = `${Math.round(day.apparentTemperatureMin)} / ${Math.round(day.apparentTemperatureMax)}F`;
      }
    });
    results.push(prediction);
  }

  return results;
};


app.get('/trip', async (req, res) => {
  const predictions = await getPredictions();
  res.render('index', {predictions});
})

module.exports = {
  app
};

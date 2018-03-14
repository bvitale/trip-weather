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
      date: moment(stop.date).format('dddd, MMM D'),
      location: stop.name,
      summary: `No prediction for ${stop.date}`
    };
    const stopDate = moment(stop.date);
    const options = {
      uri: `https://api.darksky.net/forecast/${process.env.API_KEY}/${stop.gps}?exclude=currently,hourly,minutely`,
      json: true
    };
    const response = await request(options);
    console.log(JSON.stringify(response, null, 2));
    response.daily.data.forEach(day => {
      const date = moment.unix(day.time);
      if (date.isSame(stopDate, 'day')) {
        prediction.summary = day.summary;
        prediction.highTemp = `${Math.round(day.apparentTemperatureMax)}F`;
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

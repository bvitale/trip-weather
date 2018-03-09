const fs = require('fs');
const moment = require('moment');
const stops = JSON.parse(fs.readFileSync('stops.json'));
const request = require('request-promise-native');



(async () => {
  const results = [];
  for (let stop of stops) {
    const prediction = {
      date: stop.date,
      location: stop.name,
      weather: `No prediction for ${stop.date}`
    };
    const stopDate = moment(stop.date);
    const options = {
      uri: `https://api.darksky.net/forecast/${process.env.API_KEY}/${stop.gps}?exclude=currently,hourly,minutely`,
      json: true
    };
    const response = await request(options);
    //console.log(response);
    response.daily.data.forEach(day => {
      //console.log(JSON.stringify(day));
      const date = moment.unix(day.time);
      console.log("looking at prediction for " + date.format());
      if (date.isSame(stopDate, 'day')) {
        prediction.summary = day.summary;
        prediction.highTemp = day.apparentTemperatureMax + 'F';
      }
    });
    results.push(prediction);
  }

  console.log('Date\t\tLocation\t\tHigh Temp\t\tSummary');
  results.forEach(result => {
    console.log(`${result.date}\t\t${result.location}\t\t${result.highTemp}\t\t${result.summary}`);
  })
})();

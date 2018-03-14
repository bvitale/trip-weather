const { app } = require('./dist/app');

const port = process.env.PORT || 3000;
// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

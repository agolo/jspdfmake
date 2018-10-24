/* eslint-disable */
const express = require('express');
const path = require('path');

const port = process.env.PORT || 3000;
const app = express();

// the __dirname is the current directory from where the script is running
app.use(express.static(`${__dirname}/public`));
app.use('/build', express.static(`${__dirname}/public/build`));

// send the user to index html page inspite of the url
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '/public/index.html'));
});

app.listen(port);

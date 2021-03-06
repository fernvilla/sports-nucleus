require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const adminBro = require('./admin');

const app = express();

app.use(adminBro.path, adminBro.router);

app.use(passport.initialize());
require('./config/passport')(passport);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use('/api', routes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '/client/build')));

// The "catch all" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

module.exports = app;

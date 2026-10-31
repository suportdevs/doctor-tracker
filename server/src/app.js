const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const config = require('./config');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

// The Express app (no server start here — see server.js — so it can be imported by tests).
const app = express();
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.clientUrls }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
if (config.env !== 'test') app.use(morgan(config.env === 'production' ? 'tiny' : 'dev'));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), { maxAge: '30d' }));

app.use('/api', routes);
app.use('/api', notFound);
app.use(errorHandler);

module.exports = app;

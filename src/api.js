'use strict';

const axios = require('axios');

const client = typeof API_URL === 'undefined' ? axios.create() : axios.create({
  baseURL: API_URL
});

module.exports = client;
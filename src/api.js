'use strict';

const axios = require('axios');

let client = null;
if (typeof API_URL === 'undefined') {
  client = axios.create();
} else {
  client = axios.create({
    baseURL: API_URL,
  });
}

module.exports = client;

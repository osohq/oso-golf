'use strict';

global.HAS_PASSWORD = false;
global.API_URL = 'http://localhost:3000';

const connect = require('../db/connect');
const dotenv = require('dotenv');

dotenv.config({
  path: `${__dirname}/../.env.test`
});

// For frontend tests
const fs = require('fs');

require.extensions['.html'] = function(module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

before(async function() {
  await connect();
});

after(async function() {
  const conn = await connect();
  await conn.close();
});
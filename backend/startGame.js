'use strict';

const Archetype = require('archetype');
const Log = require('../db/log'); 
const Player = require('../db/player');
const connect = require('../db/connect');
const extrovert = require('extrovert');
const { inspect } = require('util');
const oso = require('../oso');

const StartGameParams = new Archetype({
  sessionId: {
    $type: 'string',
    $required: true
  },
  name: {
    $type: 'string',
    $required: true
  },
  email: {
    $type: 'string',
    $required: true
  },
  password: {
    $type: 'string'
  }
}).compile('StartGameParams');

module.exports = async function startGame(params) {
  const { sessionId, name, email, password } = new StartGameParams(params);

  if (process.env.OSO_GOLF_PASSWORD && process.env.OSO_GOLF_PASSWORD !== password) {
    throw new Error('Incorrect password');
  }

  await connect();

  await Log.info(`startGame ${inspect(params)}`, {
    ...params,
    function: 'startGame'
  });
  
  try {
    const player = await Player.create({
      sessionId,
      name,
      email
    });
  
    await oso.tell(
      'has_relation',
      { type: 'Repository', id: `${params.sessionId}_osohq/configs` },
      'organization',
      { type: 'Organization', id: 'osohq' }
    );
  
    await oso.tell(
      'has_relation',
      { type: 'Repository', id: `${params.sessionId}_osohq/sample-apps` },
      'organization',
      { type: 'Organization', id: 'osohq' }
    );
  
    await oso.tell(
      'has_relation',
      { type: 'Repository', id: `${params.sessionId}_osohq/nodejs-client` },
      'organization',
      { type: 'Organization', id: 'osohq' }
    );
    
    return { player };
  } catch (err) {
    await Log.error(`startGame: ${err.message}`, {
      ...params,
      function: 'startGame',
      message: err.message,
      stack: err.stack,
      err: inspect(err)
    });

    throw err;
  }
};
'use strict';

require('./setup');

const Player = require('../db/player');
const assert = require('assert');
const connect = require('../db/connect');
const { after, before, beforeEach, describe, it } = require('node:test');
const oso = require('../oso');
const sinon = require('sinon');
const tell = require('../backend/tell');

describe('tell', function() {
  let player;

  before(async function() {
    await connect();
    await Player.deleteMany({});

    player = await Player.create({
      sessionId: 'test',
      name: 'John Smith',
      email: 'john@gmail.com',
      contextFacts: []
    });
  });

  beforeEach(async function() {
    player = await Player.findById(player._id).orFail();
    player.contextFacts = [];
    await player.save();
  });

  after(async function() {
    const conn = await connect();
    await conn.close();
  });

  it('adds has_role facts to contextFacts', async function() {
    await tell({
      sessionId: player.sessionId,
      factType: 'role',
      userId: 'Alice',
      role: 'admin',
      resourceType: 'Repository',
      resourceId: 'osohq/web'
    });

    player = await Player.findById(player._id).orFail();
    assert.deepStrictEqual(player.contextFacts, [[
      'has_role',
      { type: 'User', id: 'Alice' },
      'admin',
      { type: 'Repository', id: 'osohq/web' }
    ]]);
  });

  it('adds superadmin global role to contextFacts', async function() {
    await tell({
      sessionId: player.sessionId,
      factType: 'role',
      userId: 'Anthony',
      role: 'superadmin'
    });

    player = await Player.findById(player._id).orFail();
    assert.deepStrictEqual(player.contextFacts, [[
      'has_role',
      { type: 'User', id: 'Anthony' },
      'superadmin'
    ]]);
  });
});
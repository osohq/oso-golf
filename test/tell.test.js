'use strict';

require('./setup');

const Player = require('../db/player');
const assert = require('assert');
const connect = require('../db/connect');
const { after, before, describe, it } = require('node:test');
const oso = require('../oso');
const sinon = require('sinon');
const tell = require('../backend/tell');

describe('tell', function() {
  before(async function() {
    await connect();
    await Player.deleteMany({});
  });

  after(async function() {
    const conn = await connect();
    await conn.close();
  });

  it('adds has_role facts to contextFacts', async function() {
    const { _id, sessionId } = await Player.create({
      sessionId: 'test',
      name: 'John Smith',
      email: 'john@gmail.com',
      contextFacts: []
    });

    await tell({
      sessionId,
      factType: 'role',
      userId: 'Alice',
      role: 'admin',
      resourceType: 'Repository',
      resourceId: 'osohq/web'
    });

    const player = await Player.findById(_id).orFail();
    assert.deepStrictEqual(player.contextFacts, [[
      'has_role',
      { type: 'User', id: 'Alice' },
      'admin',
      { type: 'Repository', id: 'osohq/web' }
    ]]);
  });
});
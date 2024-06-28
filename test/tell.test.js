'use strict';

require('./setup');

const Player = require('../db/player');
const assert = require('assert');
const tell = require('../backend/tell');

describe('tell', function () {
  let player;

  before(async function () {
    await Player.deleteMany({});

    player = await Player.create({
      sessionId: 'test-tell',
      name: 'John Smith',
      email: 'john@gmail.com',
      contextFacts: [],
    });
  });

  beforeEach(async function () {
    player = await Player.findById(player._id).orFail();
    player.contextFacts = [];
    await player.save();
  });

  after(async function () {
    //const conn = await connect();
    //await conn.close();
  });

  it('adds has_role facts to contextFacts', async function () {
    await tell({
      sessionId: player.sessionId,
      factType: 'role',
      userId: 'Alice',
      role: 'admin',
      resourceType: 'Repository',
      resourceId: 'osohq/web',
    });

    player = await Player.findById(player._id).orFail();
    assert.deepStrictEqual(player.contextFacts, [
      [
        'has_role',
        { type: 'User', id: 'Alice' },
        'admin',
        { type: 'Repository', id: 'osohq/web' },
      ],
    ]);
  });

  it('adds superadmin global role to contextFacts', async function () {
    await tell({
      sessionId: player.sessionId,
      factType: 'role',
      userId: 'Anthony',
      role: 'superadmin',
    });

    player = await Player.findById(player._id).orFail();
    assert.deepStrictEqual(player.contextFacts, [
      ['has_role', { type: 'User', id: 'Anthony' }, 'superadmin'],
    ]);
  });

  it('adds has_default_role attribute to contextFacts', async function () {
    await tell({
      sessionId: player.sessionId,
      factType: 'attribute',
      attribute: 'has_default_role',
      attributeValue: 'true',
      resourceType: 'Organization',
      resourceId: 'org1',
    });

    player = await Player.findById(player._id).orFail();
    assert.deepStrictEqual(player.contextFacts, [
      ['has_default_role', { type: 'Organization', id: 'org1' }, 'true'],
    ]);
  });

  it('adds has_group attribute to contextFacts', async function () {
    await tell({
      sessionId: player.sessionId,
      factType: 'attribute',
      attribute: 'has_group',
      attributeValue: 'group1',
      resourceType: 'Project',
      resourceId: 'proj1',
    });

    player = await Player.findById(player._id).orFail();
    assert.deepStrictEqual(player.contextFacts, [
      [
        'has_group',
        { type: 'Project', id: 'proj1' },
        { type: 'Group', id: 'group1' },
      ],
    ]);
  });

  it('adds generic attribute to contextFacts', async function () {
    await tell({
      sessionId: player.sessionId,
      factType: 'attribute',
      attribute: 'is_taco',
      attributeValue: 'true',
      resourceType: 'Repository',
      resourceId: 'osohq/web',
    });

    player = await Player.findById(player._id).orFail();
    assert.deepStrictEqual(player.contextFacts, [
      [
        'is_taco',
        { type: 'Repository', id: 'osohq/web' },
        { type: 'Boolean', id: 'true' },
      ],
    ]);
  });
});

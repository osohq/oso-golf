'use strict';

require('./setup');

const Player = require('../db/player');
const assert = require('assert');
const clearContextFacts = require('../backend/clearContextFacts');

describe('clearContextFacts', function () {
  before(async function () {
    await Player.deleteMany({});
  });

  it('empties the player\'s contextFacts by sessionId', async function () {
    const { _id, sessionId } = await Player.create({
      sessionId: 'test-clearContextFacts',
      name: 'John Smith',
      email: 'john@gmail.com',
      contextFacts: [['has_role', { type: 'User', id: 'alice' }, 'superadmin']],
    });

    await clearContextFacts({ sessionId });

    const player = await Player.findById(_id).orFail();
    assert.strictEqual(player.contextFacts.length, 0);
  });
});

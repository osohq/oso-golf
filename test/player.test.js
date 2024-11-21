'use strict';

const Player = require('../db/player');
const assert = require('assert');
const levels = require('../levels');
const parByLevel = levels.map((level) => level.par);

describe('scoring a level', function () {
  it('scores each level and updates total score relative to par', function () {
    const player = new Player();
    player.contextFacts = [[]]; // 1 (empty, doesn't matter) fact, 1 below par for level 1
    player.scoreLevel(1, parByLevel);
    assert.equal(player.par, -1);

    player.par = 0; // reset par
    player.contextFacts = [[], [], []]; // 1 above par for level 1
    player.scoreLevel(1, parByLevel);
    assert.equal(player.par, 1);

    player.contextFacts = [[], [], []]; // 1 below par for level 2, maintain previous overall score
    player.scoreLevel(2, parByLevel);
    assert.equal(player.par, -1);
  });
});

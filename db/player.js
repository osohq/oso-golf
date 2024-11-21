'use strict';

const mongoose = require('mongoose');

const playerSchema = mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    requrired: true,
  },
  email: {
    type: String,
  },
  parPerLevel: {
    type: [Number],
  },
  par: {
    type: Number,
  },
  levelsCompleted: {
    type: Number,
    default: 0,
  },
  contextFacts: [{ type: 'Mixed' }],
});

/*
Calculate the delta from par for this level, and update overall delta from par,
storing both on the Player instance
*/
playerSchema.methods.scoreLevel = function (level, parByLevel) {
  // we don't currently keep track of strokes in each level,
  // but we do keep track of delta from par, so we can figure out
  // how many strokes were made in previous levels
  const previousStrokes =
    parByLevel.slice(0, level - 1).reduce((sum, v) => sum + v, 0) +
    (this.par || 0);

  // calculate strokes in this level by subtracting strokes in
  // previous levels from total strokes, then calculate delta from par
  this.parPerLevel[level - 1] =
    this.contextFacts.length - previousStrokes - parByLevel[level - 1];

  this.par = this.parPerLevel.reduce((sum, v) => sum + v, 0);
};

const Player = mongoose.models.Player ?? mongoose.model('Player', playerSchema);

module.exports = Player;

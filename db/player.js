'use strict';

const mongoose = require('mongoose');

const Player =
  mongoose.models.Player ??
  mongoose.model(
    'Player',
    mongoose.Schema({
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
        required: true,
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
    }),
  );

module.exports = Player;

'use strict';

const BaseComponent = require('../base-component');
const api = require('../api');
const levels = require('../../levels');
const template = require('./splash-screen.html');

module.exports = (app) =>
  app.component('splash-screen', {
    inject: ['state'],
    data: () => ({ name: '', errors: {} }),
    props: ['onStartGame'],
    extends: BaseComponent,
    name: 'splash-screen',
    template,
    methods: {
      async startGame() {
        if (this.state.level !== 0) {
          return;
        }
        this.errors = {};
        if (!this.name) {
          this.errors.name = 'Name is required';
        }
        if (Object.keys(this.errors).length > 0) {
          return;
        }

        const { player } = await api
          .post('/api/start-game', {
            sessionId: this.state.sessionId,
            name: this.name,
            email: this.email,
            password: this.password,
          })
          .then((res) => res.data);

        this.state.level = 1;
        this.state.currentLevel = levels[0];
        this.state.player = player;
        this.state.name = player.name;
        await this.onStartGame();
      },
    },
  });

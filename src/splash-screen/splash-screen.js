'use strict';

const BaseComponent = require('../base-component');
const api = require('../api');
const levels = require('../../levels');
const template = require('./splash-screen.html');

module.exports = (app) =>
  app.component('splash-screen', {
    inject: ['state'],
    data: () => ({ email: '', name: '', password: '', errors: {} }),
    props: ['onStartGame'],
    extends: BaseComponent,
    name: 'splash-screen',
    template,
    computed: {
      hasPassword() {
        return HAS_PASSWORD;
      },
    },
    methods: {
      async startGame() {
        if (this.state.level !== 0) {
          return;
        }
        this.errors = {};
        if (!this.email) {
          this.errors.email = 'Email is required';
        }
        if (!this.name) {
          this.errors.name = 'Name is required';
        }
        if (!this.password && this.hasPassword) {
          this.errors.password = 'Password is required';
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
        await this.onStartGame();
      },
    },
  });

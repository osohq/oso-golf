'use strict';

const BaseComponent = require('../base-component');
const template = require('./oso-footer.html');

module.exports = app => app.component('oso-footer', {
  extends: BaseComponent,
  name: 'oso-footer',
  template
});
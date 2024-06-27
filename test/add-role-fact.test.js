'use strict';

require('./setup');

const AddRoleFact = require('../src/add-role-fact/add-role-fact');
const axios = require('axios');
const assert = require('assert');
const { createSSRApp, provide, reactive } = require('vue');
const levels = require('../levels');
const { renderToString } = require('vue/server-renderer');
const sinon = require('sinon');

describe('AddRoleFact', function () {
  let appInstance = null;
  let state = null;
  beforeEach(async function () {
    state = reactive({
      sessionId: 'roleFactTest',
      level: 0,
      currentLevel: levels[0],
      facts: [],
      constraints: levels[0].constraints,
      results: null,
      showNextLevelButton: true,
    });
    const app = createSSRApp({
      data: () => ({ actorType: 'User' }),
      template: '<add-role-fact :actorType="actorType" />',
      created() {
        appInstance = this;
      },
      setup() {
        provide('state', state);
      },
    });
    AddRoleFact(app);

    await renderToString(app);
  });

  afterEach(() => sinon.restore());

  it('sends facts and reruns tests', async function () {
    const component = appInstance.$options.$children[0];

    component.userId = 'Alice';
    component.role = 'admin';
    component.resourceType = 'Organization';
    component.resourceId = 'osohq';

    sinon.stub(axios, 'put').callsFake(async () => {});
    sinon.stub(axios, 'get').callsFake(async () => ({
      data: {
        authorized: true,
      },
    }));
    await component.sendRoleFact();

    assert.equal(axios.put.getCalls().length, 1);
    assert.equal(axios.put.getCalls()[0].args[0], '/api/tell');
    assert.deepStrictEqual(axios.put.getCalls()[0].args[1], {
      sessionId: 'roleFactTest',
      factType: 'role',
      actorType: 'User',
      userId: 'Alice',
      role: 'admin',
      resourceType: 'Organization',
      resourceId: 'osohq',
    });

    assert.deepStrictEqual(state.results, [
      {
        userId: 'Alice',
        action: 'read',
        resourceType: 'Organization',
        resourceId: 'osohq',
        pass: true,
      },
      {
        userId: 'Anthony',
        action: 'add_member',
        resourceType: 'Organization',
        resourceId: 'osohq',
        pass: true,
      },
    ]);
    assert.equal(state.showNextLevelButton, true);
  });

  it('handles test failures', async function () {
    const component = appInstance.$options.$children[0];

    component.userId = 'Alice';
    component.role = 'admin';
    component.resourceType = 'Organization';
    component.resourceId = 'osohq';

    sinon.stub(axios, 'put').callsFake(async () => {});
    sinon.stub(axios, 'get').callsFake(async (url, { params }) => {
      return {
        data: {
          authorized: params.userId === 'Alice',
        },
      };
    });
    await component.sendRoleFact();

    assert.deepStrictEqual(state.results, [
      {
        userId: 'Alice',
        action: 'read',
        resourceType: 'Organization',
        resourceId: 'osohq',
        pass: true,
      },
      {
        userId: 'Anthony',
        action: 'add_member',
        resourceType: 'Organization',
        resourceId: 'osohq',
        pass: false,
      },
    ]);
    assert.equal(state.showNextLevelButton, false);
  });
});

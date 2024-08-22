'use strict';

require('./setup');

const Player = require('../db/player');
const assert = require('assert');
const backend = require('../backend');
const components = require('../src/components');
const connect = require('../db/connect');
const express = require('express');
const { createSSRApp, provide, reactive } = require('vue');
const oso = require('../oso');
const levels = require('../levels');
const { renderToString } = require('vue/server-renderer');

const policy = require('fs').readFileSync(
  `${__dirname}/../src/policy.polar`,
  'utf8',
);

describe('e2e test', function () {
  let appInstance = null;
  let server = null;
  let state = null;

  before(async function () {
    await connect();
    await Player.deleteMany({});
  });

  before(async function () {
    state = reactive({
      sessionId: 'e2eTest',
      level: 0,
      currentLevel: levels[0],
      facts: [],
      results: [],
      constraints: levels[0].constraints,
      showNextLevelButton: true,
    });
    const app = createSSRApp({
      data: () => ({}),
      template: '<app-component />',
      created() {
        appInstance = this;
      },
      setup() {
        provide('state', state);
      },
    });
    for (const component of Object.values(components)) {
      component(app);
    }
    await renderToString(app);
  });

  before(async function () {
    await oso.policy(policy);

    const app = express();
    app.use(express.json());
    for (const endpoint of Object.keys(backend)) {
      app.all(`/api/${kebabize(endpoint)}`, function (req, res) {
        backend[endpoint]({ ...req.body, ...req.query })
          .then((result) => res.json(result))
          .catch((err) => {
            console.error(err);
            res.status(500).json({ message: err.message });
          });
      });
    }
    server = await app.listen(3000);
  });

  after(async function () {
    await server.close();
  });

  it('can complete first level', async function () {
    this.timeout(10000);

    const appComponent = appInstance.$options.$children[0];

    // Complete splash screen
    const splashScreenComponent = appComponent.$options.$children.find(
      (el) => el.$options.name === 'splash-screen',
    );
    splashScreenComponent.name = 'John Smith';
    splashScreenComponent.email = 'john@gmail.com';
    await splashScreenComponent.startGame();
    assert.strictEqual(state.level, 1);
    assert.deepStrictEqual(state.results, [
      {
        userId: 'Alice',
        action: 'read',
        resourceType: 'Organization',
        resourceId: 'osohq',
        pass: false,
      },
      {
        userId: 'Anthony',
        action: 'add_member',
        resourceType: 'Organization',
        resourceId: 'osohq',
        pass: false,
      },
    ]);

    // Add first fact
    const levelComponent = appComponent.$options.$children.find(
      (el) => el.$options.name === 'level',
    );
    const addRoleFactComponent = levelComponent.$options.$children.find(
      (el) => el.$options.name === 'add-role-fact',
    );

    addRoleFactComponent.userId = 'Alice';
    addRoleFactComponent.role = 'admin';
    addRoleFactComponent.resourceType = 'Organization';
    addRoleFactComponent.resourceId = 'osohq';

    await addRoleFactComponent.sendRoleFact();

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
    assert.ok(!state.showNextLevelButton);

    // Add second fact
    addRoleFactComponent.userId = 'Anthony';
    addRoleFactComponent.role = 'admin';
    addRoleFactComponent.resourceType = 'Organization';
    addRoleFactComponent.resourceId = 'osohq';

    await addRoleFactComponent.sendRoleFact();

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
    assert.ok(state.showNextLevelButton);

    // Advance to next level
    await levelComponent.verifySolutionForLevel();
    assert.strictEqual(state.level, 2);
    assert.deepStrictEqual(state.results, [
      {
        userId: 'Bob',
        action: 'read',
        resourceType: 'Organization',
        resourceId: 'osohq',
        pass: false,
      },
      {
        userId: 'Bob',
        action: 'add_member',
        resourceType: 'Organization',
        resourceId: 'osohq',
        pass: false,
      },
      {
        userId: 'Bill',
        action: 'read',
        resourceType: 'Organization',
        resourceId: 'osohq',
        pass: false,
      },
      {
        userId: 'Bill',
        action: 'add_member',
        resourceType: 'Organization',
        resourceId: 'osohq',
        pass: true,
        shouldFail: true,
      },
    ]);
  });
});

const kebabize = (str) =>
  str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? '-' : '') + $.toLowerCase(),
  );

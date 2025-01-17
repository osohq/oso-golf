'use strict';

const levels = require('../levels');
const vanillatoasts = require('vanillatoasts');

const sessionId =
  window.localStorage.getItem('_gitclubGameSession') ||
  [...Array(30)].map(() => Math.random().toString(36)[2]).join('');
window.localStorage.setItem('_gitclubGameSession', sessionId);

window.setLevel = require('./_methods/setLevel');
window.runTests = require('./_methods/runTests');

const app = Vue.createApp({
  template: `
  <div>
    <div class="view">
      <router-view :key="$route.fullPath" />
    </div>
  </div>
  `,
  setup() {
    const state = Vue.reactive({
      organizations: ['osohq', 'acme'],
      repositories: [
        'osohq/sample-apps',
        'osohq/configs',
        'osohq/nodejs-client',
        'acme/website',
      ],
      constraints: levels[0].constraints,
      results: [],
      facts: [],
      sessionId,
      level: 0,
      currentLevel: null,
      par: 0,
      errors: {},
      showNextLevelButton: false,
      name: '',
      player: null,
    });

    Vue.provide('state', state);

    window.state = state;

    return state;
  },
  async errorCaptured(err) {
    const title = err?.response?.data?.message ?? err.message;
    vanillatoasts.create({
      title,
      icon: '/images/failure.jpg',
      timeout: 5000,
      positionClass: 'bottomRight',
    });
  },
});

// Import all components
const requireComponents = require.context(
  '.', // Relative path (current directory)
  true, // Include subdirectories
);
// Object to store the imported modules
const components = {};
// Iterate over the matched keys (file paths)
requireComponents.keys().forEach((filePath) => {
  // Extract directory name and file name from the path
  const pieces = filePath.split('/');
  const directoryName = pieces[pieces.length - 2];
  const fileName = pieces[pieces.length - 1].replace('.js', '');

  // Check if the file name matches the directory name
  if (directoryName === fileName) {
    components[directoryName] = requireComponents(filePath);
    components[directoryName](app);
  }
});

console.log('Loaded components', Object.keys(components).sort());

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: app.component('app-component'),
    },
  ],
});

// Set the correct initial route: https://github.com/vuejs/vue-router/issues/866
router.replace(window.location.pathname);
app.use(router);

app.mount('#content');

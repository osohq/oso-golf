'use strict';

const Archetype = require('archetype');
const oso = require('../oso');

const AuthorizeParams = new Archetype({
  sessionId: {
    $type: 'string',
    $required: true
  },
  userId: {
    $type: 'string',
    $required: true
  },
  action: {
    $type: 'string',
    $required: true
  },
  resourceType: {
    $type: 'string',
    $required: true
  },
  resourceId: {
    $type: 'string',
    $required: true
  }
}).compile('AuthorizeParams');

module.exports = async function authorize(params) {
  params = new AuthorizeParams(params);
  const authorized = await oso.authorize(
    { type: 'User', id: `${params.sessionId}_${params.userId}` },
    params.action,
    { type: params.resourceType, id: params.resourceId }
  );

  return { authorized };
};
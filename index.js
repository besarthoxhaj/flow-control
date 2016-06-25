'use strict';

require('regenerator-runtime/runtime');

require('babel-core/register')({
  presets:['es2015'],
  plugins:[
    'transform-object-rest-spread',
    'transform-flow-strip-types',
    'transform-async-to-generator',
    'syntax-async-functions'
  ]
});

const utils = require('./utils.js');
const createResetPass = require('./reset_password.js').create;
const setResetPass = require('./reset_password.js').set;

createResetPass({
  userId:1
}).then(state => {
  console.log('state',state);
  return utils.sleep(state,1000);
}).then(state => {
  return setResetPass({
    resetCode:state.resetCodeEntry.code,
    password:'corret',
    confirmPassword:'corret'
  });
}).then(state => {
  console.log('state',state);
}).catch(error => {
  console.log('error',error);
});

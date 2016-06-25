'use strict';

const Promise = require('bluebird');
const R = require('ramda');
const pipeP = R.pipeP;
const partial = R.partial;

/**
 * Approach proposed 'Flow State'.
 * It consists of defining an object
 * which will describe all the possible
 * deterministic state composition.
 * In this example it is:
 * {
 *   invalid:boolean,
 *   reason:string,
 *   userEntry:Array<User>,
 *   resetCodeEntry:Array<ResetCode>,
 *   emailSent:boolean
 * }
 */

const DB = require('./utils.js').database();


/**
 * [initialState description]
 * @type {Object}
 */
const rawState = {
  valid:true,
  reason:undefined,
  password:undefined,
  confirmPassword:undefined,
  hashPassword:undefined,
  userId:undefined,
  userEntry:undefined,
  newUserEntry:undefined,
  resetCodeEntry:undefined,
  newResetCodeEntry:undefined,
  resetCode:undefined,
  emailSent:undefined
};

module.exports = {
  create:pipeP(
    partial(getUser,[rawState]),
    partial(createResetCode,[rawState]),
    partial(sendEmail,[rawState])
  ),
  set:pipeP(
    partial(checkResetCode,[rawState]),
    partial(setUserId,[rawState]),
    partial(getUser,[rawState]),
    partial(validatePass,[rawState]),
    partial(hashPass,[rawState]),
    partial(updateUser,[rawState]),
    partial(invalidateResetCode,[rawState])
  )
};

/**
 * [getUser description]
 * @param  {[type]} initialState [description]
 * @param  {[type]} currentState [description]
 * @return {[type]}              [description]
 */
function getUser (initialState,currentState) {
  if (currentState.valid === false) {
    return Promise.props({
      ...initialState,
      ...currentState
    });
  }
  if (currentState.userId === undefined) {
    return Promise.props({
      ...initialState,
      ...currentState,
      valid:false,
      reason:'User id must be provied'
    });
  }
  return Promise.props({
    ...initialState,
    ...currentState,
    userEntry:DB.get('users','id',currentState.userId)
  });
}

/**
 * [createResetCode description]
 * @param {[type]} initialState [description]
 * @param {[type]} currentState [description]
 */
function createResetCode (initialState,currentState) {
  if (currentState.valid === false) {
    return Promise.props({
      ...initialState,
      ...currentState
    });
  }
  if (!currentState.userId === undefined) {
    return Promise.props({
      ...initialState,
      ...currentState,
      valid:false,
      reason:'User id must be provied'
    });
  }
  return Promise.props({
    ...initialState,
    ...currentState,
    resetCodeEntry:DB.add('resetCodes',{
      userId:currentState.userId,
      hasBeenUsed:false,
      code:String(Math.floor(Math.random()*900000+100000))
    })
  });
}

/**
 * [sendEmail description]
 * @param  {[type]} initialState [description]
 * @param  {[type]} currentState [description]
 * @return {[type]}              [description]
 */
function sendEmail (initialState,currentState) {
  if (currentState.valid === false) {
    return Promise.props({
      ...initialState,
      ...currentState
    });
  }
  if (currentState.userId === undefined) {
    return Promise.props({
      ...initialState,
      ...currentState,
      valid:false,
      reason:'User id must be provied'
    });
  }
  if (currentState.userEntry === undefined) {
    return Promise.props({
      ...initialState,
      ...currentState,
      valid:false,
      reason:`User must be provied in order
      to send email`
    });
  }
  if (currentState.resetCodeEntry === undefined) {
    return Promise.props({
      ...initialState,
      ...currentState,
      valid:false,
      reason:`ResetCode must be provied in order
      to send email`.split('\n').map(e => e.trim()).join(' ')
    });
  }
  return Promise.props({
    ...initialState,
    ...currentState,
    emailSent:true
  });
}

/**
 * [checkResetCode description]
 * @param {[type]} initialState [description]
 * @param {[type]} currentState [description]
 */
function checkResetCode (initialState,currentState) {
  if (currentState.valid === false) {
    return Promise.props({
      ...initialState,
      ...currentState
    });
  }
  if (currentState.resetCode === undefined) {
    return Promise.props({
      ...initialState,
      ...currentState,
      valid:false,
      reason:`ResetCode must be provied
      in order to retrive user and update
      password`.split('\n').map(e => e.trim()).join(' ')
    });
  }
  return Promise.props({
    ...initialState,
    ...currentState,
    resetCodeEntry:DB.get('resetCodes','code',currentState.resetCode)
  });
}

/**
 * [setUserId description]
 * @param {[type]} initialState [description]
 * @param {[type]} currentState [description]
 */
function setUserId (initialState,currentState) {
  if (currentState.valid === false) {
    return Promise.props({
      ...initialState,
      ...currentState
    });
  }
  if (currentState.resetCodeEntry === undefined) {
    return Promise.props({
      ...initialState,
      ...currentState,
      valid:false,
      reason:`ResetCode probably not found`
    });
  }
  return Promise.props({
    ...initialState,
    ...currentState,
    userId:currentState.resetCodeEntry[0].userId
  });
}

function validatePass (initialState,currentState) {
  if (currentState.valid === false) {
    return Promise.props({
      ...initialState,
      ...currentState
    });
  }
  if (
    currentState.password === undefined
    || currentState.confirmPassword === undefined
    || currentState.password !== currentState.confirmPassword
  ) {
    return Promise.props({
      ...initialState,
      ...currentState,
      valid:false,
      reason:`Please 'password' and 'confirmPassword'
      must be provided and be equal`.split('\n').map(e => e.trim()).join(' ')
    });
  }
  return Promise.props({
    ...initialState,
    ...currentState
  });
}

/**
 * [hashPass description]
 * @param  {[type]} initialState [description]
 * @param  {[type]} currentState [description]
 * @return {[type]}              [description]
 */
function hashPass (initialState,currentState) {
  if (currentState.valid === false) {
    return Promise.props({
      ...initialState,
      ...currentState
    });
  }
  if (currentState.password === undefined) {
    return Promise.props({
      ...initialState,
      ...currentState,
      valid:false,
      reason:`ResetCode probably not found`
    });
  }
  return Promise.props({
    ...initialState,
    ...currentState,
    hashPassword:currentState.password.split('').reverse().join('')
  });
}

/**
 * [updateUser description]
 * @param  {[type]} initialState [description]
 * @param  {[type]} currentState [description]
 * @return {[type]}              [description]
 */
function updateUser (initialState,currentState) {
  if (currentState.valid === false) {
    return Promise.props({
      ...initialState,
      ...currentState
    });
  }
  return Promise.props({
    ...initialState,
    ...currentState,
    newUserEntry:DB.set(
      'users',
      'id',
      currentState.userId,
      'password',
      currentState.hashPassword
    )
  });
}

/**
 * [invalidateResetCode description]
 * @param {[type]} initialState [description]
 * @param {[type]} currentState [description]
 */
function invalidateResetCode (initialState,currentState) {
  if (currentState.valid === false) {
    return Promise.props({
      ...initialState,
      ...currentState
    });
  }
  return Promise.props({
    ...initialState,
    ...currentState,
    newResetCodeEntry:DB.set(
      'resetCodes',
      'code',
      currentState.resetCode,
      'hasBeenUsed',
      true
    )
  });
}

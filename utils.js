'use strict';

const Promise = require('bluebird');

exports.database = () => {
  /**
  * Example resetCode
  * {
  *   userId:number,
  *   code:Number,
  *   createdAt:Date,
  *   hasBeenUsed:Boolean
  * }
  */
  let core = {
    resetCodes:[],
    users:[{
      id:1,
      name:'Bes',
      email:'bes@gmail.com',
      password:'wrong'
    }]
  };
  return {
    get:(what,param,value) => {
      return new Promise((resolve,reject) => {
        process.nextTick(() => {
          if(!what || !param || !value){
            return reject(`
              Provied right arguments to get:
              'what', 'param' and 'value'
            `);
          }
          var result = core[what].filter(elm => elm[param] === value);
          if(result.length === 0){
            return resolve([]);
          } else {
            return resolve(JSON.parse(JSON.stringify(result)));
          }
        });
      });
    },
    add:(what,entry) => {
      return new Promise((resolve,reject) => {
        process.nextTick(() => {
          const insertingEntry = {
            ...entry,
            createdAt:Math.floor(Date.now()/1000)
          };
          core[what].push(insertingEntry);
          return resolve(JSON.parse(JSON.stringify(insertingEntry)));
        });
      });
    },
    set:(what,searchParam,valueParam,param,value) => {
      return new Promise((resolve,reject) => {
        process.nextTick(() => {
          if(!what || !searchParam || !valueParam || !param || !value){
            return reject(`Provide right arguments to set:
              'what', 'searchParam', 'valueParam', 'param' and 'value'
            `.split('\n').map(e => e.trim()).join(' '));
          }
          const result = core[what].filter(elm => {
            return elm[searchParam] === valueParam;
          })[0];
          if(result.length === 0){
            return resolve([]);
          } else {
            result[param] = value;
            return resolve(JSON.parse(JSON.stringify(result)));
          }
        });
      });
    }
  };
};

exports.sleep = (state,time) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(state);
    },time);
  });
};

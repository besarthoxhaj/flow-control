'use strict';

const Promise = require('bluebird');
const R = require('ramda');

function sayHello (name) {
  return new Promise((resolve,reject) => {
    process.nextTick(() => {
      resolve(`Hello, ${name}!`);
    });
  });
}

function getName (id) {
  if (!R.is(Number,id)) {
    throw new TypeError('getName function accepts only numbers');
  }
  if(id === 1) {
    return '';
  }
  return new Promise((resolve,reject) => {
    process.nextTick(() => {
      resolve('Bes');
    });
  });
}

async function createPhrase (id) {
  try {
    var nameUser = await getName(id);
    if (nameUser === '') {
      console.log('Stop!');
      return;
    }
    console.log('Create phrase...');
    var hiPhrase = await sayHello(nameUser);
    console.log(hiPhrase);
    return hiPhrase;
  } catch (error) {
    console.log('Error: ',error);
  }
};

var one = createPhrase(1);
console.log('one',one);
// one Promise { <pending> }
// Create phrase...
// Hello, Bes!

one.then(function(result){
  console.log('result',result);
  // result Hello, Bes!
}).catch(function(error){
  console.log('error',error);
});

(async function (){
  var two = await createPhrase(2);
  console.log('two',two);
  // two Hello, Bes!
}());

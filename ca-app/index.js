'use strict';
const argv = require('yargs').argv;

console.log('Hello to CA!');
if (argv.help || argv.h) {
    console.log('Usage: ');
}
else {
    console.log('Do something: ' + argv._);
}

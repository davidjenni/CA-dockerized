'use strict';

const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = class OpenSsl {
    constructor(config) {
        this._config = config;
    }

    exec(verb, options) {
        let args = [];
        Object.keys(options).forEach((key) => args.push(`-${key}`, options[key]));
        return exec(['openssl', verb].concat(args).join(' '));
    }
}

'use strict';

const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

module.exports = class OpenSsl {
    constructor(config) {
        this._config = config;
    }

    exec(verb, options) {
        let args = [];
        Object.keys(options).forEach((key) => args.push(`-${key}`, options[key]));
        return execFile('openssl', [ verb ].concat(args));
    }
}

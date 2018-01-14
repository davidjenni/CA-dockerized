'use strict';

const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

const opensslExe = 'openssl';

module.exports = class OpenSsl {
    constructor() {
    }

    async exec(verb, options) {
        let args = [];
        if (this._configFile) {
            args.push('-config', this._configFile);
        }
        Object.keys(options).forEach((key) => args.push(`-${key}`, options[key]));
        return execFile(opensslExe, [ verb ].concat(args));
    }
}

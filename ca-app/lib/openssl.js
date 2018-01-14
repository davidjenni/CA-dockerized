'use strict';

const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

const opensslExe = 'openssl';

module.exports = class OpenSsl {
    constructor(configFile) {
        if (configFile) {
            this._configFile = configFile;
        }
    }

    async exec(verb, options) {
        let args = [];
        Object.keys(options).forEach((key) => args.push(`-${key}`, options[key]));
        return execFile(opensslExe, [ verb ].concat(args));
    }
}

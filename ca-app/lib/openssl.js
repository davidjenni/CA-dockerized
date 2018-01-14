'use strict';

const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

const opensslExe = 'openssl';

module.exports = class OpenSsl {
    constructor() {
    }

    /**
     * Execute the openssl verb and options.
     * @param {string} verb - e.g. rand, ca, req, @see {@link https://www.openssl.org/docs/manmaster/man1/|OpenSSL commands}
     * @param {*} options - map of options for verb, e.g. { hex: 16 } will get converted as parameters: "-hex 16"
     */
    async exec(verb, options) {
        let args = [];
        if (this._configFile) {
            args.push('-config', this._configFile);
        }
        Object.keys(options).forEach((key) => args.push(`-${key}`, options[key]));
        return execFile(opensslExe, [ verb ].concat(args));
    }
}

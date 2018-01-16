'use strict';

const _ = require('lodash');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

const opensslExe = 'openssl';

module.exports = class OpenSsl {
    constructor() {
    }

    /**
     * Execute the openssl verb and options.
     * @param {string} verb - e.g. rand, ca, req, @see {@link https://www.openssl.org/docs/manmaster/man1/|OpenSSL commands}
     * @param {object} options - map of options for verb, e.g. { hex: 16 } will get converted as parameters: ""
     * @param {object} parameters - map or parameters to CA config file
     */
    async exec(verb, options, parameters) {
        let args = [];
        Object.keys(options).forEach((key) => {
            let val = options[key];
            if (val !== '$binary') {
                args.push(`-${key}`, val);
            } else {
                args.push(`-${key}`);
            }
        });
        let env = _.extend(_.cloneDeep(process.env), parameters);
        return execFile(opensslExe, [ verb ].concat(args), { env: env });
    }
}

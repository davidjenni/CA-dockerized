'use strict';

const _ = require('lodash');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

const opensslExe = 'openssl';

module.exports = class OpenSsl {
    constructor() {
    }

    /**
     * Execute openssl verb and options.
     * @param {string} verb - e.g. rand, ca, req, @see {@link https://www.openssl.org/docs/manmaster/man1/|OpenSSL commands}
     * @param {(string|object)[]} options - array of options for verb; any object will get converted as tuple, e.g. { hex: 16 } => [ '-hex], '16' ]
     * @param {object} [parameters] - optional: map or parameters to CA config file
     */
    async exec(verb, options, parameters) {
        if (!verb) throw new Error('Must have first argument: verb');
        if (!Array.isArray(options)) {
            options = [ options ];
        }
        let args = [];
        options.forEach((option) => {
            if (typeof option !== 'object') {
                args.push(`-${option}`);
            } else {
                appendTo(option, args);
            }
        });
        let env = _.extend(_.cloneDeep(process.env), parameters);
        return execFile(opensslExe, [ verb ].concat(args), { env: env });
    }
}

function appendTo(map, args) {
    Object.keys(map).forEach((key) => {
        let val = map[key];
        if (val !== '$binary') {
            args.push(`-${key}`, val);
        } else {
            args.push(`-${key}`);
        }
    });
}

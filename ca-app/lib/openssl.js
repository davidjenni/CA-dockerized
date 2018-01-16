'use strict';

const _ = require('lodash');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

const opensslExe = 'openssl';

module.exports = class OpenSsl {
    constructor(workingDir = '.') {
        if (workingDir !== '.') {
            this._workingDir = workingDir;
        }
    }

    /**
     * Execute openssl verb and options.
     * @param {string} verb - e.g. rand, ca, req, @see {@link https://www.openssl.org/docs/manmaster/man1/|OpenSSL commands}
     * @param {(string|object)[]} options - array of options for verb; any object will get converted as tuple, e.g. { hex: 16 } => [ '-hex], '16' ]
     * @param {object} [parameters] - optional: map or parameters to CA config file
     * @returns {Promise} - returns a object with 'stdout' and 'stderr' properties, @see {@link https://nodejs.org/api/child_process.html#child_process_child_process_execfile_file_args_options_callback}
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
        let execOptions = { env: env };
        if (this._workingDir) {
            execOptions.cwd = this._workingDir;
        }
        return execFile(opensslExe, [ verb ].concat(args), execOptions);
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

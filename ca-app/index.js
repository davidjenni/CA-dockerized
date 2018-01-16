'use strict';
const yargs = require('yargs');

const argv = yargs.usage('Private Certificate Authority\r\n$0 command [options]')
    .command([ 'initRootCA', 'init', 'i' ], 'initialize a new root CA', {
        'orgName': {
            description: 'organization name to use in cert Subject and CA domain name',
            alias: 'n',
            default: 'example',
            string: true
        }
    })
    .demandCommand()
    .help().alias('help', 'h')
    .showHelpOnFail()
    .version().alias('version', 'v')
    .strict()
    .argv;

/*eslint no-console: ["error", { allow: ["dir", "error"] }] */
console.dir(argv);

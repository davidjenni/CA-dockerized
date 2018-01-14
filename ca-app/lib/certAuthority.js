'use strict';

const fs = require('fs');
const path = require('path');
const OpenSsl = require('./openssl');

module.exports = class CertAuthority {
    /**
     * New certificate authority
     * @param {string} caBaseDir - base directory for non-secret CA file artifacts like index and public certs
     * @param {string} secretsBaseDir - base directory for secrets: key files
     * @param {object} configFiles - paths for root and sub CA: { rootCA: 'path', subCA: 'path' }
     */
    constructor(caBaseDir, secretsBaseDir, configFiles) {
        this._dbDir = path.join(caBaseDir, 'db');
        this._certsDir = path.join(caBaseDir, 'certs');
        this._secretsBaseDir = secretsBaseDir;
        this._configFiles = configFiles;
        this._openSsl = new OpenSsl();
    }

    async createRootCA() {
        await this._initCA();
    }

    async _initCA() {
        let dbFile = path.join(this._dbDir, 'index');
        fs.closeSync(fs.openSync(dbFile, 'a'));

        const result = await this._openSsl.exec('rand', { hex: '16' });
        if (result.stderr.length > 0) throw Error (`Error creating random number with openssl: ${result.stdErr}`);
        fs.writeFileSync(path.join(this._dbDir, 'serial'), result.stdout, 'utf8');
    }
}

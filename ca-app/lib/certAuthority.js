'use strict';

const fs = require('fs-extra');
const path = require('path');
const OpenSsl = require('./openssl');

/*eslint no-console: ["error", { allow: ["dir", "error"] }] */

module.exports = class CertAuthority {
    /**
     * New certificate authority
     * @param {string} caBaseDir - base directory for non-secret CA file artifacts like index and public certs
     * @param {string} secretsDir - directory for secrets: key files
     * @param {object} configFiles - paths for root and sub CA: { rootCA: 'path', subCA: 'path' }
     */
    constructor(caBaseDir, secretsDir, configFiles) {
        this._dbDir = path.join(caBaseDir, 'db');
        this._certsDir = path.join(caBaseDir, 'certs');
        this._secretsDir = secretsDir;
        this._configFiles = configFiles || { rootCA: 'config/root-ca.conf', subCA: 'config/sub-ca.conf' };
        this._configFileParams = {
            home_dir: caBaseDir,
            secrets_dir: secretsDir
        };

        this._openSsl = new OpenSsl();
    }

    async initRootCA() {
        await this._createAuthFiles();
        await this._createRootKey('foo');
        await this._signRootCert('foo');
    }

    async _createAuthFiles() {
        fs.ensureDirSync(this._dbDir);
        fs.ensureDirSync(this._certsDir);
        fs.ensureDirSync(this._secretsDir);

        let dbFile = path.join(this._dbDir, 'index');
        fs.closeSync(fs.openSync(dbFile, 'a'));

        const result = await this._openSsl.exec('rand', { hex: '16' });
        fs.writeFileSync(path.join(this._dbDir, 'serial'), result.stdout, 'utf8');
    }

    async _createRootKey(keyPassword) {
        const result = await this._openSsl.exec('req', [
            'new', 'batch', {
                config: this._configFiles.rootCA,
                out: 'root-ca.csr',
                passout: `pass:${keyPassword}`
            }], this._configFileParams)
            .catch((err) => {
                console.error(`createRootKey: openssl error: ${err.message}`);
                throw err;
            });
        console.error(result.stderr);
    }

    async _signRootCert(keyPassword) {
        const result = await this._openSsl.exec('ca', [
            'selfsign', 'batch', {
                config: 'config/root-ca.conf',
                in: 'root-ca.csr',
                out: 'root-ca.crt',
                extensions: 'ca_ext',
                passin: `pass:${keyPassword}`,
            }], this._configFileParams)
            .catch((err) => {
                console.error(`signRootCert: openssl error: ${err.message}`);
                throw err;
            });
        console.error(result.stderr);
    }
}

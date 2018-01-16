'use strict';

const fs = require('fs-extra');
const path = require('path');
const OpenSsl = require('./openssl');

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

    /**
     * Initialize Root CA: create database, generate and sign root CA certificate
     * @param {string} keyPassword - password to encrypt root CA private key file
     * @returns {Promise} - returns an object with CA cert filename and validity
     */
    async initRootCA(keyPassword) {
        await this._createAuthFiles();
        await this._createRootKey(keyPassword);
        return await this._signRootCert(keyPassword);
    }

    async _createAuthFiles() {
        // creating CA files is idempotent; although each call will generate a new serial
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
            }], this._configFileParams);
        return result.stderr;
    }

    async _signRootCert(keyPassword) {
        const result = await this._openSsl.exec('ca', [
            'selfsign', 'batch', {
                config: 'config/root-ca.conf',
                in: 'root-ca.csr',
                out: 'root-ca.crt',
                extensions: 'ca_ext',
                passin: `pass:${keyPassword}`,
            }], this._configFileParams);
        let lines = result.stderr.split(/\n|\r\n/);
        let rootCertInfo = {}
        for (let lineNr = 0; lineNr < lines.length; lineNr++) {
            let line = lines[lineNr];
            if (!rootCertInfo.certFile && line.match(/Serial Number:/)) {
                let serNumber = lines[lineNr + 1];
                rootCertInfo.certificateFile = path.join(this._certsDir, serNumber.trim().split(':').join('').toUpperCase() + '.pem');
            } else if (!rootCertInfo.notBefore && line.match(/Validity/)) {
                rootCertInfo.notBefore = extractDate(lines[lineNr + 1]);
                rootCertInfo.notAfter = extractDate(lines[lineNr + 2]);
                break;
            }
        }
        return rootCertInfo;
    }
}

function extractDate(detailLine) {
    let [ , dateString ] = detailLine.split(/\w+\s*:\s+/, 2);
    return new Date(dateString);
}

'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const OpenSsl = require('./openssl');

module.exports = class CertAuthority {
    /**
     * New certificate authority
     * @param {string} caBaseDir - base directory for non-secret CA file artifacts like index and public certs
     * @param {string} secretsDir - directory for secrets: key files
     * @param {string} configRootCA - path to config file for rootCA; default: 'config/root-ca.conf'
     * @param {string} configSubCA - path to config file for subCA; default: 'config/sub-ca.conf'
     * @param {object} configFileParams - optional: $ENV:: parameters for CA config files: org_name, domain_suffix, country_code
     */
    constructor(caBaseDir, secretsDir, configRootCA, configSubCA, configFileParams) {
        this._dbDir = path.join(caBaseDir, 'db');
        this._certsDir = path.join(caBaseDir, 'certs');
        this._reqsDir = path.join(caBaseDir, 'requests');
        this._secretsDir = secretsDir;
        this._configFileRootCA = path.resolve(configRootCA || 'config/root-ca.conf');
        this._configFileSubCA = path.resolve(configSubCA || 'config/sub-ca.conf');

        this._configFileParams = {
            home_dir: caBaseDir,
            secrets_dir: secretsDir
        };
        if (configFileParams) {
            this._configFileParams = _.extend(this._configFileParams, configFileParams);
        }

        this._openSsl = new OpenSsl(this._reqsDir);
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

    /**
     * Add a sub CA to root CA: creates and signs an intermediate CA cert
     * @param {*} rootKeyPassword - password to decrypt root CA private key
     * @param {*} subKeyPassword - password to encrypt subCA private key
     * @returns {Promise} - returns an object with CA cert filename and validity
     */
    async addSubCA(rootKeyPassword, subKeyPassword) {
        await this._createSubKey(subKeyPassword);
        return await this._signSubCert(rootKeyPassword);
    }

    async _createAuthFiles() {
        // creating CA files is idempotent; although each call will generate a new serial
        fs.ensureDirSync(this._dbDir);
        fs.ensureDirSync(this._certsDir);
        fs.ensureDirSync(this._reqsDir);
        fs.ensureDirSync(this._secretsDir);

        let dbFile = path.join(this._dbDir, 'index');
        fs.closeSync(fs.openSync(dbFile, 'a'));

        const result = await this._openSsl.exec('rand', { hex: '16' });
        fs.writeFileSync(path.join(this._dbDir, 'serial'), result.stdout, 'utf8');
    }

    async _createRootKey(keyPassword) {
        const result = await this._openSsl.exec('req', [
            'new', 'batch', {
                config: this._configFileRootCA,
                out: 'root-ca.csr',
                passout: `pass:${keyPassword}`
            }], this._configFileParams);
        return result.stderr;
    }

    async _signRootCert(keyPassword) {
        const result = await this._openSsl.exec('ca', [
            'selfsign', 'batch', 'notext', {
                config: this._configFileRootCA,
                in: 'root-ca.csr',
                out: '../certs/root-ca.pem',
                extensions: 'ca_ext',
                passin: `pass:${keyPassword}`,
            }], this._configFileParams);

        return this._extractCertInfo(result.stderr);
    }

    async _createSubKey(subKeyPassword) {
        const result = await this._openSsl.exec('req', [
            'new', 'batch', {
                config: this._configFileSubCA,
                out: 'sub-ca.csr',
                passout: `pass:${subKeyPassword}`
            }], this._configFileParams);
        return result.stderr;
    }

    async _signSubCert(rootKeyPassword) {
        const result = await this._openSsl.exec('ca', [
            'batch', 'notext', {
                config: this._configFileRootCA,
                in: 'sub-ca.csr',
                out: '../certs/sub-ca.pem',
                extensions: 'sub_ca_ext',
                passin: `pass:${rootKeyPassword}`,
            }], this._configFileParams);

        return this._extractCertInfo(result.stderr);
    }

    _extractCertInfo(caOutput) {
        let lines = caOutput.split(/\n|\r\n/);
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

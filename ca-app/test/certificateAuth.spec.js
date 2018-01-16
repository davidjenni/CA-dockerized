'use strict';
require('./support/setup');

const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
tmp.setGracefulCleanup();

const CertAuthority = require('../lib/certAuthority');
const OpenSsl = require('../lib/openssl');

describe('certAuthority', () => {
    beforeEach(() => {
        this._tmpDir = tmp.dirSync({ unsafeCleanup: true });
        let dirname = this._tmpDir.name;
        this._dirname = dirname;
        this._dbDir = path.join(dirname, 'db');
        this._certsDir = path.join(dirname, 'certs');
        this._secretsDir = path.join(dirname, 'secrets');
        this._configFiles = { rootCA: './config/root-ca.conf', subCA: './config/sub-ca.conf' };
    });

    it('initialize root CA, default parameters', async () => {
        let certAuth = new CertAuthority(this._dirname, this._secretsDir, this._configFiles.rootCA, this._configFiles.subCA);
        let info = await certAuth.initRootCA('foo');

        // CA files (db and serial) have been created:
        assert(fs.existsSync(path.join(this._dbDir, 'index')));
        let serialFile = path.join(this._dbDir, 'serial');
        assert(fs.existsSync(serialFile));
        let size = fs.lstatSync(serialFile).size;
        expect(size).to.be.at.least(33);

        let privKeyFile = path.join(this._secretsDir, 'root-ca.key');
        assert(fs.existsSync(privKeyFile));
        let privKey = fs.readFileSync(privKeyFile, 'utf8');
        privKey.should.match(/-----BEGIN ENCRYPTED PRIVATE KEY-----/);
        let indexFile = path.join(this._dbDir, 'index');
        fs.lstatSync(indexFile).size.should.be.above(50);

        expect(info).to.exist;
        expect(info).to.have.property('certificateFile');
        assert(fs.existsSync(info.certificateFile));
        let certFile = fs.readFileSync(info.certificateFile, 'utf8');
        certFile.should.match(/-----BEGIN CERTIFICATE-----/);
        expect(info).to.have.property('notBefore');
        expect(info).to.have.property('notAfter');
    });

    it('initialize root CA, override CA config file parameters', async () => {
        let configParams = {
            org_name: 'another-org',
            domain_suffix: 'info',
            country_code: 'CH'
        };
        let certAuth = new CertAuthority(this._dirname, this._secretsDir, this._configFiles.rootCA, this._configFiles.subCA, configParams);
        let info = await certAuth.initRootCA('foo');
        expect(info).to.exist;
        expect(info).to.have.property('certificateFile');
        assert(fs.existsSync(info.certificateFile));
        // parse .pem file with openssl and verify Issuer and Subject have override values:
        let openssl = new OpenSsl();
        let subject = await openssl.exec('x509', [{ in: info.certificateFile }, 'noout', 'subject']);
        subject.stdout.should.match(/\/C=CH\/O=another-org\/CN=Root CA/);
        let issuer = await openssl.exec('x509', [{ in: info.certificateFile }, 'noout', 'issuer']);
        issuer.stdout.should.match(/\/C=CH\/O=another-org\/CN=Root CA/);
    });

    afterEach(() => {
        this._tmpDir.removeCallback();
    });
});

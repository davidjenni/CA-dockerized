'use strict';
require('./support/setup');

const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
tmp.setGracefulCleanup();
const CertAuth = require('../lib/certAuthority');

describe('certAuthority', () => {
    beforeEach(() => {
        this._tmpDir = tmp.dirSync({ unsafeCleanup: true });
        let dirname = this._tmpDir.name;
        this._dbDir = path.join(dirname, 'db');
        this._certsDir = path.join(dirname, 'certs');
        this._secretsDir = path.join(dirname, 'secrets');
        this._auth = new CertAuth(dirname, this._secretsDir, { rootCA: './config/root-ca.conf', subCA: './config/sub-ca.conf' });
    });

    it('initialize root CA', async () => {
        let info = await this._auth.initRootCA('foo');

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

    afterEach(() => {
        this._tmpDir.removeCallback();
    });
});

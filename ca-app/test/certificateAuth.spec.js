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
        this._secretsDir = path.join(dirname, 'secrets');
        this._auth = new CertAuth(dirname, this._secretsDir, { rootCA: './config/root-ca.conf' });
    });

    it('initialize root CA', async () => {
        await this._auth.initRootCA();
        // CA files (db and serial) have been created:
        assert(fs.existsSync(path.join(this._dbDir, 'index')));
        let serialFile = path.join(this._dbDir, 'serial');
        assert(fs.existsSync(serialFile));
        let size = fs.lstatSync(serialFile).size;
        expect(size).to.be.at.least(33);
    });

    afterEach(() => {
        this._tmpDir.removeCallback();
    });
});

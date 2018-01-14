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
        fs.mkdirSync(this._dbDir);
        this._auth = new CertAuth(dirname, dirname, { rootCA: '../config/root-ca.conf' });
    });

    it('create root CA', async () => {
        await this._auth.createRootCA();
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

'use strict';
require('./support/setup');

const OpenSsl = require('../lib/openssl');

describe('openssl', () => {
    beforeEach(() => {
        this.openssl = new OpenSsl('ff');
    });

    it('rand verb returns stdout', () => {
        this.openssl.exec('rand', { hex: '16' }).should.be.fulfilled;
    });
});
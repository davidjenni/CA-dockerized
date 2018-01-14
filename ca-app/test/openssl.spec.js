'use strict';
require('./support/setup');

const OpenSsl = require('../lib/openssl');

describe('openssl', () => {
    beforeEach(() => {
        this.openssl = new OpenSsl('ff');
    });

    it('rand verb returns stdout', () => {
        this.openssl.exec('rand', { hex: '16' }).should.be.fulfilled;
        this.openssl.exec('rand', { hex: '16' })
            .then(result => {
                expect(result.stderr).to.be.empty;
                expect(result.stdout).to.be.a('string');
                result.stdout.trim().should.have.lengthOf(32);
            });
    });

    it('unknown verb returns stderr', () => {
        this.openssl.exec('bla', { someArg: '16' }).should.be.fulfilled;
        this.openssl.exec('bla', { someArg: '16' })
            .then(result => {
                expect(result.stdout).to.be.empty;
                expect(result.stderr).to.be.a('string');
            });

    });
});
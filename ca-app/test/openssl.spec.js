'use strict';
require('./support/setup');

const OpenSsl = require('../lib/openssl');

describe('openssl', () => {
    beforeEach(() => {
        this.openssl = new OpenSsl();
    });

    it('rand verb returns stdout', async () => {
        const result = await this.openssl.exec('rand', [{ hex: '16' }]);
        expect(result.stderr).to.be.empty;
        expect(result.stdout).to.be.a('string');
        result.stdout.trim().should.have.lengthOf(32);
    });

    it('single option as object will be recognized as tuple', async () => {
        const result = await this.openssl.exec('rand', { hex: '16' });
        expect(result.stderr).to.be.empty;
        expect(result.stdout).to.be.a('string');
        result.stdout.trim().should.have.lengthOf(32);
    });

    it('unknown verb returns stderr', async () => {
        const result = await this.openssl.exec('bla', { someArg: '16' })
        expect(result.stdout).to.be.empty;
        expect(result.stderr).to.be.a('string');
    });

    it('missing verb throws', async () => {
        await this.openssl.exec().should.be.rejected;
    });
});
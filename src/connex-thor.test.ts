const { expect } = require('chai') // Using require for webpack-ed code to be shown in mocha report without webpack injects
const { isValidSemVer } = require('./types')

describe('connex object', () => {

    it('connex should be attached to Window object', () => {
        expect(window.connex).to.be.an('object')
    })

    it('connex object properties', () => {
        expect(window.connex).to.have.property('version')
        expect(window.connex).to.have.property('thor')
        expect(window.connex).to.have.property('vendor')
    })

    it('connex.version should be a valid SemVer', () => { 
        expect(isValidSemVer(window.connex.version)).to.be.true
    })

})


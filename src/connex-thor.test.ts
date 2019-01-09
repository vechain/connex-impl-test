const { ensureBlock, ensureStatus } = require('./validator')
const { expect } = require('chai')
const { isSemVer } = require('./types')
const { promiseWrapper } = require('./utils')


describe('connex', () => {

    it('connex should be attached to Window object', () => {
        expect(window.connex).to.be.an('object')
    })

    it('ensure connex object properties', () => {
        expect(connex).to.have.all.keys('version', 'thor','vendor')
    })

})

describe('connex.version', () => {

    it('connex.version should be a valid SemVer', () => {
        expect(isSemVer(connex.version)).to.be.true
    })

})

describe('connex.thor', () => {

    it('ensure connex.thor object properties', () => {
        expect(connex.thor).to.have.all.keys('genesis', 'status', 'ticker', 'account', 'block', 'transaction', 'filter','explain')
    })

    describe('connex.thor.genesis', () => { 
        
        it('ensure connex.thor.genesis object properties', () => {
            expect(connex.thor.genesis).to.have.all.keys('beneficiary', 'gasLimit', 'gasUsed', 'id', 'number', 'parentID', 'receiptsRoot', 'signer', 'size', 'stateRoot', 'timestamp', 'totalScore', 'transactions','txsRoot')
        })

        it('connex.thor.genesis ID should be testnet\'s genesis ID', () => {
            expect(connex.thor.genesis.id).to.be.equal('0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127', "Implementation test only can be run under testnet or mainnet environment")
        })

        it('connex.thor.genesis should be an block', () => {
            ensureBlock(connex.thor.genesis)
        })
    })

    describe('connex.thor.status', () => {

        it('connex.thor.status should be an status', () => {
            ensureStatus(connex.thor.status)
        })
        
    })

    // describe('connex.thor.ticker', () => {

    //     it('connex.thor.ticker should be resolved without error thrown', (done) => {
    //         connex.thor.ticker().next().then(() => {
    //             done()
    //         }).catch(e => {
    //             done(e)
    //         })
    //     })

    // })

    describe('connex.thor.account', () => { })

    describe('connex.thor.block', () => { 
        
        it('getBlock should return a block', (done) => {
            promiseWrapper(connex.thor.block(0).get().then((blk) =>{
                ensureBlock(blk)
                done()
            }), done)
        })

        it('getBlock should accept block ID as parameter', (done) => {
            promiseWrapper(connex.thor.block(connex.thor.genesis.id).get().then((blk) => {
                ensureBlock(blk)
                done()
            }), done)
        })

        it('getBlock invalid block ID should return null', (done) => {
            promiseWrapper(connex.thor.block('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').get().then((blk) => {
                expect(blk).to.be.null
                done()
            }), done)
        })

    })

    describe('connex.thor.transaction', () => { })

    describe('connex.thor.filter', () => { })

    describe('connex.thor.explain', () => { })

})
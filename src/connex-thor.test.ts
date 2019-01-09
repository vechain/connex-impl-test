const { ensureBlock, ensureStatus, ensureTransaction, ensureTransactionReceipt } = require('./validator')
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

    describe('connex.thor.ticker', () => {

        it('connex.thor.ticker should be resolved without error thrown', (done) => {
            connex.thor.ticker().next().then(() => {
                done()
            }).catch(e => {
                done(e)
            })
        })

    })

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

    describe('connex.thor.transaction', () => { 

        it('getTransaction should return a transaction', (done) => {
            promiseWrapper(connex.thor.transaction('0x9daa5b584a98976dfca3d70348b44ba5332f966e187ba84510efb810a0f9f851').get().then((tx) => {
                ensureTransaction(tx)
                done()
            }), done)
        })

        it('getTransaction invalid block ID should return null', (done) => {
            promiseWrapper(connex.thor.transaction('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').get().then((tx) => {
                expect(tx).to.be.null
                done()
            }), done)
        })

        it('getTransactionReceipt should return a transaction receipt', (done) => {
            promiseWrapper(connex.thor.transaction('0x9daa5b584a98976dfca3d70348b44ba5332f966e187ba84510efb810a0f9f851').getReceipt().then((receipt) => {
                ensureTransactionReceipt(receipt)
            }).then(() => {
                return connex.thor.transaction('0x316072e16a794a8f385e9f261a102c49947aa82a0355006289707b667e841cdc').getReceipt()
            }).then((receipt) => {
                ensureTransactionReceipt(receipt)
                done()
            }), done)
        })

        it('getTransactionReceipt invalid block ID should return null', (done) => {
            promiseWrapper(connex.thor.transaction('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').getReceipt().then((receipt) => {
                expect(receipt).to.be.null
                done()
            }), done)
        })

    })

    describe('connex.thor.filter', () => { })

    describe('connex.thor.explain', () => { })

})
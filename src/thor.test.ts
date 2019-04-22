const { ensureBlock, ensureStatus, ensureTransaction, ensureTransactionReceipt, ensureAccount, ensureVMOutput, ensureEventCriteria, ensureEventLog, ensureTransferLog } = require('./validator')
const { expect } = require('chai')
const { isSemVer, isHexBytes, isAddress, isBytes32 } = require('./types')
const { promiseWrapper } = require('./utils')
const { Certificate } = require('thor-devkit')

const transferEventABI = { "anonymous": false, "inputs": [{ "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Transfer", "type": "event" }
const candidateEventABI = { "anonymous": false, "inputs": [{ "indexed": true, "name": "nodeMaster", "type": "address" }, { "indexed": false, "name": "action", "type": "bytes32" }], "name": "Candidate", "type": "event" }
const nameABI = { "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "pure", "type": "function" }
const transferABI = { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }
const addMasterABI = { "constant": false, "inputs": [{ "name": "_nodeMaster", "type": "address" }, { "name": "_endorsor", "type": "address" }, { "name": "_identity", "type": "bytes32" }], "name": "add", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }

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
            expect(connex.thor.genesis).to.have.all.keys('beneficiary', 'gasLimit', 'gasUsed', 'id', 'isTrunk', 'number', 'parentID', 'receiptsRoot', 'signer', 'size', 'stateRoot', 'timestamp', 'totalScore', 'transactions','txsRoot')
        })

        it('connex.thor.genesis ID should be testnet\'s genesis ID', () => {
            expect(connex.thor.genesis.id).to.be.equal('0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127', "Implementation test only can be run under testnet environment")
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

        it('connex.thor.ticker should be resolved without error thrown', done => {
            connex.thor.ticker().next().then(() => {
                done()
            }).catch(e => {
                done(e)
            })
        })

    })

    describe('connex.thor.account', () => {

        it('get account should return a account detail', done => {
            promiseWrapper(connex.thor.account('0xe59d475abe695c7f67a8a2321f33a856b0b4c71d').get().then(acc => {
                ensureAccount(acc)
                done()
            }), done)
        })

        it('get code should return code', done => {
            promiseWrapper(connex.thor.account('0x0000000000000000000000000000456e65726779').getCode().then(code => {
                expect(isHexBytes(code.code), 'code should be a hex format string').to.be.true
                done()
            }), done)
        })

        it('get storage should return storage', done => {
            promiseWrapper(connex.thor.account('0x0000000000000000000000000000456e65726779').getStorage('0x0000000000000000000000000000000000000000000000000000000000000001').then(storage => {
                expect(isHexBytes(storage.value), 'code should be a hex format string').to.be.true
                done()
            }), done)
        })

        describe('connex.thor.account(...).method', () => {

            it('call name method should return name', (done) => {
                const nameMethod = connex.thor.account('0x0000000000000000000000000000456e65726779').method(nameABI)
                promiseWrapper(nameMethod.call().then(output => {
                    ensureVMOutput(output)
                    expect(output.decoded).to.have.property('0', 'VeThor')
                    done()
                }), done)
            })

            it('call contract method set low gas should revert and gasUsed should be the setted gas', (done) => {
                const nameMethod = connex.thor.account('0x0000000000000000000000000000456e65726779').method(nameABI)
                nameMethod.gas(1)
                promiseWrapper(nameMethod.call().then(output => {
                    ensureVMOutput(output)
                    expect(output.gasUsed).to.be.equal(1)
                    expect(output.reverted).to.be.true
                    done()
                }), done)
            })

            it('set value and convert to clause should return clause with correct value', () => {
                const nameMethod = connex.thor.account('0x0000000000000000000000000000456e65726779').method(nameABI)
                nameMethod.value(0x64)
                const clause = nameMethod.asClause()
                expect(clause).to.have.property('to', '0x0000000000000000000000000000456e65726779')
                expect(clause).to.have.property('value', '100')
                expect(clause).to.have.property('data', '0x06fdde03')
            })

            it("add master by non-executor should have revert reason returned", (done) => {
                const addMasterMethod = connex.thor.account('0x0000000000000000000000417574686f72697479').method(addMasterABI)
                promiseWrapper(addMasterMethod.call('0x0000000000000000000000417574686f72697479', '0x0000000000000000000000417574686f72697479', '0x0000000000000000000000000000000000000000000000417574686f72697479').then(output => {
                    expect(output).to.have.property('reverted', true)
                    expect(output).to.have.property('decoded')
                    expect(output.decoded).to.have.property('revertReason', 'builtin: executor required')
                    done()
                }), done)
            })
        })

        describe('connex.thor.account(...).event', () => { 

            it('asCriteria should produce correct criteria', () => {
                const transferEvent = connex.thor.account('0x0000000000000000000000000000456e65726779').event(transferEventABI)
                const criteria = transferEvent.asCriteria({
                    _to: '0xd3ae78222beadb038203be21ed5ce7c9b1bff602'
                })
                ensureEventCriteria(criteria)
                expect(criteria).to.have.property('address', '0x0000000000000000000000000000456e65726779')
                expect(criteria).to.have.property('topic0', '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef')
                expect(criteria).to.have.property('topic2', '0x000000000000000000000000d3ae78222beadb038203be21ed5ce7c9b1bff602')
            })

            it('filter should return the candidate event log', (done) => {
                const transferEvent = connex.thor.account('0x0000000000000000000000417574686f72697479').event(candidateEventABI)
                const filter = transferEvent.filter([]).order('desc')
                promiseWrapper(filter.apply(0,1).then(logs => { 
                    expect(logs.length).to.be.equal(1)

                    const log = logs[0]
                    const decoded = logs[0].decoded as { [index: string]: any }
                    
                    ensureEventLog(log, true)
                    expect(decoded).to.have.any.keys('0', '1', 'action', 'nodeMaster')
                    expect(isAddress(decoded['nodeMaster']), 'nodeMaster should be an address').to.be.true
                    expect(isBytes32(decoded['action']), 'action should be an address').to.be.true
                    done()
                }), done)
            })

        })

    })

    describe('connex.thor.block', () => { 
        
        it('getBlock should return a block', done => {
            promiseWrapper(connex.thor.block(0).get().then(blk =>{
                ensureBlock(blk)
                done()
            }), done)
        })

        it('getBlock should accept block ID as parameter', done => {
            promiseWrapper(connex.thor.block(connex.thor.genesis.id).get().then(blk => {
                ensureBlock(blk)
                done()
            }), done)
        })

        it('getBlock invalid block ID should return null', done => {
            promiseWrapper(connex.thor.block('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').get().then(blk => {
                expect(blk).to.be.null
                done()
            }), done)
        })

    })

    describe('connex.thor.transaction', () => { 

        it('getTransaction should return a transaction', done => {
            promiseWrapper(connex.thor.transaction('0x9daa5b584a98976dfca3d70348b44ba5332f966e187ba84510efb810a0f9f851').get().then(tx => {
                ensureTransaction(tx)
                done()
            }), done)
        })

        it('getTransaction invalid block ID should return null', done => {
            promiseWrapper(connex.thor.transaction('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').get().then(tx => {
                expect(tx).to.be.null
                done()
            }), done)
        })

        it('getTransactionReceipt should return a transaction receipt', done => {
            promiseWrapper(connex.thor.transaction('0x9daa5b584a98976dfca3d70348b44ba5332f966e187ba84510efb810a0f9f851').getReceipt().then(receipt => {
                ensureTransactionReceipt(receipt)
            }).then(() => {
                return connex.thor.transaction('0x316072e16a794a8f385e9f261a102c49947aa82a0355006289707b667e841cdc').getReceipt()
            }).then(receipt => {
                ensureTransactionReceipt(receipt)
                done()
            }), done)
        })

        it('getTransactionReceipt invalid block ID should return null', done => {
            promiseWrapper(connex.thor.transaction('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').getReceipt().then(receipt => {
                expect(receipt).to.be.null
                done()
            }), done)
        })

    })

    describe('connex.thor.filter', () => { 

        it('filter transfer event should return the transfer log', (done) => {
            const filter = connex.thor.filter('transfer').order('desc').criteria([{ txOrigin: '0xe59D475Abe695c7f67a8a2321f33A856B0B4c71d' }])
            promiseWrapper(filter.apply(0, 1).then(logs => {
                expect(logs.length).to.be.equal(1)
                ensureTransferLog(logs[0], true)
                done()
            }), done)
        })

    })

    describe('connex.thor.explain', () => { 

        it('explain should return valid vmoutput', (done) => {
            const transferMethod = connex.thor.account('0x0000000000000000000000000000456e65726779').method(transferABI)
            const energyClause = transferMethod.asClause('0xd3ae78222beadb038203be21ed5ce7c9b1bff602', 1)

            const explainer = connex.thor.explain()
            explainer
                .gas(200000)
                .caller('0xe59d475abe695c7f67a8a2321f33a856b0b4c71d')
            
            promiseWrapper(explainer.execute([
                {
                    to: '0xd3ae78222beadb038203be21ed5ce7c9b1bff602',
                    value: 1,
                    data: '0x'
                },
                energyClause
            ]).then(outputs => {
                expect(outputs.length).to.be.equal(2)
                outputs.forEach(output => {
                     ensureVMOutput(output)
                })
                done()
            }), done)
        })

    })

})

describe('connex.vendor', () => {

    it('should own 0xf2e7617c45c42967fde0514b5aa6bba56e3e11dd in user account', () => {
        expect(connex.vendor.owned('0xf2e7617c45c42967fde0514b5aa6bba56e3e11dd')).to.be.true
    })

    it('should not own 0x0000000000000000000000000000000000000000 in user account', () => {
        expect(connex.vendor.owned('0x0000000000000000000000000000000000000000')).to.be.false
    })

    it('acquire singing service should return signing service without error', () => {
        let txSigner = connex.vendor.sign('tx')
        expect(txSigner).to.not.equal(undefined)
        let certSigner = connex.vendor.sign('cert')
        expect(certSigner).to.not.equal(undefined)
    })

    it('tx signing should return txid and signer', (done) => {
        let txSigner = connex.vendor.sign('tx')
        promiseWrapper(txSigner.request([{
            to: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
            value: '10000000000000000',
            data: '0x',
        }]).then(ret => { 
            expect(isAddress(ret.signer), 'signer should be an address').to.be.true
            expect(isBytes32(ret.txid), 'txid should be an bytes32').to.be.true
            done()
        }), done)
    })

    it('specify signer should signed by the signer', (done) => {
        let txSigner = connex.vendor.sign('tx')
        txSigner.signer('0xf2e7617c45c42967fde0514b5aa6bba56e3e11dd')
        promiseWrapper(txSigner.request([{
            to: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
            value: '10000000000000000',
            data: '0x',
        }]).then(ret => {
            expect(ret.signer).to.be.equal('0xf2e7617c45c42967fde0514b5aa6bba56e3e11dd')
            done()
        }), done)
    })

    it('identification cert signing should return valid cert response', (done) => {
        let certSigner = connex.vendor.sign('cert')
        promiseWrapper(certSigner.request({
            purpose: 'identification',
            payload: {
                type: 'text',
                content: 'random generated string'
            }
        }).then(ret => {
            expect(isHexBytes(ret.signature), 'signature be a hex format string').to.be.true
            expect(ret.annex.domain).to.be.equal(location.hostname)
            expect((connex.thor.status.head.timestamp - ret.annex.timestamp)%10)
            expect(ret.annex.timestamp).to.be.below((new Date().getTime()) / 1000).to.be.above((new Date().getTime()) / 1000-60)
            expect(isAddress(ret.annex.signer), 'signer should be an address').to.be.true
            Certificate.verify({
                purpose: 'identification',
                payload: {
                    type: 'text',
                    content: 'random generated string'
                },
                domain: ret.annex.domain,
                timestamp: ret.annex.timestamp,
                signer: ret.annex.signer,
                signature: ret.signature
            })
            done()
        }), done)
    })

    it('agreement cert signing should return valid cert response', (done) => {
        let certSigner = connex.vendor.sign('cert')
        promiseWrapper(certSigner.request({
            purpose: 'agreement',
            payload: {
                type: 'text',
                content: 'agreement'
            }
        }).then(ret => {
            expect(isHexBytes(ret.signature), 'signature be a hex format string').to.be.true
            expect(ret.annex.domain).to.be.equal(location.hostname)
            expect((connex.thor.status.head.timestamp - ret.annex.timestamp) % 10)
            expect(ret.annex.timestamp).to.be.below((new Date().getTime()) / 1000).to.be.above((new Date().getTime()) / 1000 - 60)
            expect(isAddress(ret.annex.signer), 'signer should be an address').to.be.true
            Certificate.verify({
                purpose: 'agreement',
                payload: {
                    type: 'text',
                    content: 'agreement'
                },
                domain: ret.annex.domain,
                timestamp: ret.annex.timestamp,
                signer: ret.annex.signer,
                signature: ret.signature
            })
            done()
        }), done)
    })

})

describe('error type and message', () => {

    describe('connex.thor', () => { 

        it('account: invalid address should throw', done => {
            try {
                connex.thor.account('invalid address')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'addr' expected address type`)
                done()
            }
        })

        it('block: invalid block id should throw', done => {
            try {
                connex.thor.block('invalid block id')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'revision' expected bytes32 in hex string`)
                done()
            }
        })

        it('block: non-neg block number should throw', done => {
            try {
                connex.thor.block(-1)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'revision' expected non-neg 32bit integer`)
                done()
            }
        })

        it('block: invalid revision should throw', done => {
            try {
                connex.thor.block(true as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'revision' has invalid type`)
                done()
            }
        })

        it('transaction: invalid tx id should throw', done => {
            try {
                connex.thor.transaction('invalid bytes32')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'id' expected bytes32 in hex string`)
                done()
            }
        })

    })

    describe('connex.thor.explain', () => {

        it('caller: invalid address should throw', done => {
            try {
                const explainer = connex.thor.explain()
                explainer.caller('invalid address')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'addr' expected address type`)
                done()
            }
        })

        it('gas:non-neg gas should throw ', done => {
            try {
                const explainer = connex.thor.explain()
                explainer.gas(-1)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'gas' expected non-neg safe integer`)
                done()
            }
        })

        it('gasPrice:invalid string value should throw ', done => {
            try {
                const explainer = connex.thor.explain()
                explainer.gasPrice('0b00')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'gasPrice' expected integer in hex/dec string`)
                done()
            }
        })

        it('execute:non-array clauses should throw ', done => {
            try {
                const explainer = connex.thor.explain()
                explainer.execute({} as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'clauses' expected array`)
                done()
            }
        })

        it('execute:invalid address of clause.to should throw ', done => {
            try {
                const explainer = connex.thor.explain()
                explainer.execute([{
                    to: 'invalid address',
                    value: 0,
                    data: '0x'
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'clauses#0.to' expected null or address`)
                done()
            }
        })

        it('execute:non-neg clause.value should throw ', done => {
            try {
                const explainer = connex.thor.explain()
                explainer.execute([{
                    to: null,
                    value: -1,
                    data: '0x'
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'clauses#0.value' expected non-neg safe integer`)
                done()
            }
        })

        it('execute:invalid clause.value should throw ', done => {
            try {
                const explainer = connex.thor.explain()
                explainer.execute([{
                    to: null,
                    value: '0b00',
                    data: '0x'
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'clauses#0.value' expected integer in hex/dec string`)
                done()
            }
        })

        it('execute:invalid clause.data should throw ', done => {
            try {
                const explainer = connex.thor.explain()
                explainer.execute([{
                    to: null,
                    value: 0,
                    data: 'invalid data'
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'clauses#0.data' expected bytes in hex string`)
                done()
            }
        })

    })

    describe('connex.thor.account(...)', () => {
        
        it('getStorage:get storage with invalid key should throw', done => {
            try {
                connex.thor.account('0x0000000000000000000000000000456e65726779').getStorage('not bytes32 in hex')
                done(new Error('Should throw error'))
            }catch(err){
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'key' expected bytes32 in hex string`)
                done()
            }
        })

        it('event:invalid abi should throw ', done => {
            try {
                connex.thor.account('0x0000000000000000000000000000456e65726779').event({wrong: 'invalid abi'})
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(/'abi' is invalid/.test(err.message)).to.be.equal(true, `Error message should be start with 'abi' is invalid`)
                done()
            }
        })

        it('event(...).asCriteria:invalid indexed parameter should throw ', done => {
            try {
                const transferEvent = connex.thor.account('0x0000000000000000000000000000456e65726779').event(transferEventABI)
                transferEvent.asCriteria({_from: "invalid from"})
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(/'indexed' can not be encoded/.test(err.message)).to.be.equal(true, `Error message should be start with 'indexed' can not be encoded`)
                done()
            }
        })

        it('event(...).filter:invalid indexed parameter should throw ', done => {
            try {
                const transferEvent = connex.thor.account('0x0000000000000000000000000000456e65726779').event(transferEventABI)
                transferEvent.filter([{ _from: "invalid from" }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(/'indexed' can not be encoded/.test(err.message)).to.be.equal(true, `Error message should be start with 'indexed' can not be encoded`)
                done()
            }
        })

        it('method(...).value:non-neg value should throw ', done => {
            try {
                const transferMethod = connex.thor.account('0x0000000000000000000000000000456e65726779').method(transferABI)
                transferMethod.value(-1)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'value' expected non-neg safe integer`)
                done()
            }
        })

        it('method(...).value:invalid string value should throw ', done => {
            try {
                const transferMethod = connex.thor.account('0x0000000000000000000000000000456e65726779').method(transferABI)
                transferMethod.value('0b01')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'value' expected integer in hex/dec string`)
                done()
            }
        })

        it('method(...).caller:invalid address should throw ', done => {
            try {
                const transferMethod = connex.thor.account('0x0000000000000000000000000000456e65726779').method(transferABI)
                transferMethod.caller('invalid address')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'caller' expected address type`)
                done()
            }
        })

        it('method(...).gas:non-neg gas should throw ', done => {
            try {
                const transferMethod = connex.thor.account('0x0000000000000000000000000000456e65726779').method(transferABI)
                transferMethod.gas(-1)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'gas' expected non-neg safe integer`)
                done()
            }
        })

        it('method(...).gasPrice:invalid string value should throw ', done => {
            try {
                const transferMethod = connex.thor.account('0x0000000000000000000000000000456e65726779').method(transferABI)
                transferMethod.gasPrice('0b00')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'gasPrice' expected integer in hex/dec string`)
                done()
            }
        })

        it('method(...).asClause:invalid string value should throw ', done => {
            try {
                const transferMethod = connex.thor.account('0x0000000000000000000000000000456e65726779').method(transferABI)
                transferMethod.asClause('invalid address', 'invalid amount')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(/'args' can not be encoded/.test(err.message)).to.be.equal(true, `Error message should be start with 'args' can not be encoded`)
                done()
            }
        })

    })

    describe('connex.thor.filter', () => { 

        it('filter:invalid kind should throw ', done => {
            try {
                connex.thor.filter('invalid kind' as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'kind' unsupported filter kind`)
                done()
            }
        })

        it('event filter:invalid address should throw ', done => {
            try {
                const filter = connex.thor.filter('event')
                filter.criteria([{
                    address: "invalid address"
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'criteria#0.address' expected address`)
                done()
            }
        })

        it('event filter:invalid topic2 should throw ', done => {
            try {
                const filter = connex.thor.filter('event')
                filter.criteria([{
                    topic2: "invalid bytes32"
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'criteria#0.topic2' expected bytes32`)
                done()
            }
        })

        it('transfer filter:invalid txOrigin should throw ', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.criteria([{
                    txOrigin: "invalid txOrigin"
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'criteria#0.txOrigin' expected address`)
                done()
            }
        })

        it('transfer filter:invalid sender should throw ', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.criteria([{
                    sender: "invalid sender"
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'criteria#0.sender' expected address`)
                done()
            }
        })
    
        it('transfer filter:invalid recipient should throw ', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.criteria([{
                    recipient: "invalid recipient"
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'criteria#0.recipient' expected address`)
                done()
            }
        })

        it('filter:invalid range should throw ', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.range(null as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'range' expected object`)
                done()
            }
        })

        it('filter:invalid range.unit should throw ', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.range({
                    unit: 'invalid unit'
                } as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'range.unit' expected 'block' or 'time'`)
                done()
            }
        })

        it('filter:invalid range.from should throw ', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.range({
                    unit: 'block',
                    to: 100,
                    from: 'invalid from'
                } as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'range.from' expected non-neg safe integer`)
                done()
            }
        })

        it('filter:invalid range.to should throw ', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.range({
                    unit: 'block',
                    to: 'invalid to'
                } as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'range.to' expected non-neg safe integer`)
                done()
            }
        })

        it('filter:invalid order should throw ', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.order('invalid order' as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'order' expected 'asc' or 'desc'`)
                done()
            }
        })

        it('filter:invalid offset should throw ', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.apply(-1, -1)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'offset' expected non-neg safe integer`)
                done()
            }
        })

        it('filter:invalid offset should throw ', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.apply(0, 1000)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(/\'limit\'\ expected\ integer\ in\ \[0,/.test(err.message)).to.be.equal(true, `Error message should be start with 'limit' expected integer in [0,`)
                done()
            }
        })

    })

    describe('connex.vendor', () => {
        
        it('invalid address should throw', () => {
            try {
                connex.vendor.owned('invalid')
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'addr' expected address type`)
            }
        })

        it('invalid type should throw', done => {
            try {
                connex.vendor.sign('invalid' as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`unsupported message kind`)
                done()
            }
        })

        it('tx-request:invalid to should throw ', done => {
            const txSigner = connex.vendor.sign('tx')
            try {
                txSigner.request([{
                    to: 'invalid address',
                    value: 0,
                    data: '0x'
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`#0.to: expected hex string`)
                done()
            }
        })

        it('tx-request:invalid data should throw ', done => {
            const txSigner = connex.vendor.sign('tx')
            try {
                txSigner.request([{
                    to: null,
                    value: 0,
                    data: 'invalid data'
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`#0.data: expected hex string`)
                done()
            }
        })

        it('tx-request:invalid data should throw ', done => {
            const txSigner = connex.vendor.sign('tx')
            try {
                txSigner.request([{
                    to: null,
                    value: -1,
                    data: 'invalid data'
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`#0.value: expected non-negative safe integer`)
                done()
            }
        })

        it('tx-request:invalid comment should throw ', done => {
            const txSigner = connex.vendor.sign('tx')
            try {
                txSigner.request([{
                    to: null,
                    value: 0,
                    data: '0x',
                    comment: {} as any
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'#0.comment' expected string`)
                done()
            }
        })

        it('tx-request.comment:invalid comment should throw ', done => {
            const txSigner = connex.vendor.sign('tx')
            try {
                txSigner.comment({} as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'comment' expected string`)
                done()
            }
        })

        it('tx-request:invalid signer should throw ', done => {
            const txSigner = connex.vendor.sign('tx')
            try {
                txSigner.signer('invalid address')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'signer' expected address type`)
                done()
            }
        })

        it('cert-request:invalid signer should throw ', done => {
            const txSigner = connex.vendor.sign('cert')
            try {
                txSigner.signer('invalid address')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'signer' expected address type`)
                done()
            }
        })

        it('cert-request:invalid message should throw ', done => {
            const txSigner = connex.vendor.sign('cert')
            try {
                txSigner.request(0 as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`expected object`)
                done()
            }
        })

        it('cert-request:invalid purpose should throw ', done => {
            const txSigner = connex.vendor.sign('cert')
            try {
                txSigner.request({
                    purpose: 'invalid'
                } as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'purpose' expected 'agreement' or 'identification'`)
                done()
            }
        })

        it('cert-request:invalid payload.type should throw ', done => {
            const txSigner = connex.vendor.sign('cert')
            try {
                txSigner.request({
                    purpose: 'identification',
                    payload: {
                        type: 'invalid'
                    }
                } as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'payload.type' unsupported`)
                done()
            }
        })

        it('cert-request:invalid payload.content should throw ', done => {
            const txSigner = connex.vendor.sign('cert')
            try {
                txSigner.request({
                    purpose: 'identification',
                    payload: {
                        type: 'text',
                        content: 0
                    }
                } as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                expect(err.message).to.be.equal(`'payload.content' expected string`)
                done()
            }
        })

        it('request:user decline should throw rejected error', (done) => {
            const certSigner = connex.vendor.sign('cert')
            certSigner.request({
                purpose: 'identification',
                payload: {
                    type: 'text',
                    content: 'Please decline this request\nPlease decline this request\nPlease decline this request\nPlease decline this request'
                }
            }).then(() => {
                done(new Error('User decline should throw error'))
            }).catch(err => {
                expect(err.name).to.be.equal('Rejected')
                expect(err.message).to.be.equal('user cancelled')
                done()
            }).catch(err => {
                done(err)
            })
        })
    })
    
})
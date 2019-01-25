const { ensureBlock, ensureStatus, ensureTransaction, ensureTransactionReceipt, ensureAccount, ensureVMOutput, ensureEventCriteria, ensureEventLog, ensureTransferLog } = require('./validator')
const { expect } = require('chai')
const { isSemVer, isHexBytes, isAddress, isBytes32 } = require('./types')
const { promiseWrapper } = require('./utils')
const { Certificate } =require('thor-devkit')

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

            const nameABI = { "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "pure", "type": "function" }
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

        })

        describe('connex.thor.account(...).event', () => { 

            const transferEventABI = { "anonymous": false, "inputs": [{ "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Transfer", "type": "event" }
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

            it('filter should return the transfer event log', (done) => {
                const transferEvent = connex.thor.account('0x0000000000000000000000000000456e65726779').event(transferEventABI)
                const filter = transferEvent.filter([]).order('desc')
                promiseWrapper(filter.apply(0,1).then(logs => { 
                    expect(logs.length).to.be.equal(1)

                    const log = logs[0]
                    const decoded = logs[0].decoded as { [index: string]: any }
                    
                    ensureEventLog(log, true)
                    expect(decoded).to.have.any.keys('0', '1', '2', '_from', '_to', '_value')
                    expect(isAddress(decoded['_from']), '_from should be an address').to.be.true
                    expect(isAddress(decoded['_to']), '_to should be an address').to.be.true
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
            const filter = connex.thor.filter('transfer').order('desc')
            promiseWrapper(filter.apply(0, 1).then(logs => {
                expect(logs.length).to.be.equal(1)
                ensureTransferLog(logs[0], true)
                done()
            }), done)
        })

    })

    describe('connex.thor.explain', () => { 

        const transferABI = { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }
        it('filter transfer event should return the transfer log', (done) => {
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
        txSigner.signer('0x7567d83b7b8d80addcb281a71d54fc7b3364ffed')
        promiseWrapper(txSigner.request([{
            to: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
            value: '10000000000000000',
            data: '0x',
        }]).then(ret => {
            expect(ret.signer).to.be.equal('0x7567d83b7b8d80addcb281a71d54fc7b3364ffed')
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

    it('user cancel should throw rejected error', (done) => {
        let certSigner = connex.vendor.sign('cert')
        certSigner.request({
            purpose: 'identification',
            payload: {
                type: 'text',
                content: 'Please decline this request\nPlease decline this request\nPlease decline this request\nPlease decline this request'
            }
        }).then(() => {
            console.log('then')
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
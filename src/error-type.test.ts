const { expect } = require('chai')

const transferEventABI = { "anonymous": false, "inputs": [{ "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Transfer", "type": "event" }
const transferABI = { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }

export {}
describe('error type and message', () => {

    describe('connex.thor', () => {

        it('account: invalid address should throw', done => {
            try {
                connex.thor.account('invalid address')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('block: invalid block id should throw', done => {
            try {
                connex.thor.block('invalid block id')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('block: non-neg block number should throw', done => {
            try {
                connex.thor.block(-1)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('block: invalid revision should throw', done => {
            try {
                connex.thor.block(true as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('transaction: invalid tx id should throw', done => {
            try {
                connex.thor.transaction('invalid bytes32')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
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
                done()
            }
        })

        it('gas:non-neg gas should throw', done => {
            try {
                const explainer = connex.thor.explain()
                explainer.gas(-1)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('gasPrice:invalid string value should throw', done => {
            try {
                const explainer = connex.thor.explain()
                explainer.gasPrice('0b00')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('execute:non-array clauses should throw', done => {
            try {
                const explainer = connex.thor.explain()
                explainer.execute({} as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('execute:invalid address of clause.to should throw', done => {
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
                done()
            }
        })

        it('execute:non-neg clause.value should throw', done => {
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
                done()
            }
        })

        it('execute:invalid clause.value should throw', done => {
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
                done()
            }
        })

        it('execute:invalid clause.data should throw', done => {
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
                done()
            }
        })

    })

    describe('connex.thor.account(...)', () => {

        it('getStorage:get storage with invalid key should throw', done => {
            try {
                connex.thor.account('0x0000000000000000000000000000456e65726779').getStorage('not bytes32 in hex')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('event:invalid abi should throw', done => {
            try {
                connex.thor.account('0x0000000000000000000000000000456e65726779').event({ wrong: 'invalid abi' })
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('event(...).asCriteria:invalid indexed parameter should throw', done => {
            try {
                const transferEvent = connex.thor.account('0x0000000000000000000000000000456e65726779').event(transferEventABI)
                transferEvent.asCriteria({ _from: "invalid from" })
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('event(...).filter:invalid indexed parameter should throw', done => {
            try {
                const transferEvent = connex.thor.account('0x0000000000000000000000000000456e65726779').event(transferEventABI)
                transferEvent.filter([{ _from: "invalid from" }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('method(...).value:non-neg value should throw', done => {
            try {
                const transferMethod = connex.thor.account('0x0000000000000000000000000000456e65726779').method(transferABI)
                transferMethod.value(-1)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('method(...).value:invalid string value should throw', done => {
            try {
                const transferMethod = connex.thor.account('0x0000000000000000000000000000456e65726779').method(transferABI)
                transferMethod.value('0b01')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('method(...).caller:invalid address should throw', done => {
            try {
                const transferMethod = connex.thor.account('0x0000000000000000000000000000456e65726779').method(transferABI)
                transferMethod.caller('invalid address')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('method(...).gas:non-neg gas should throw', done => {
            try {
                const transferMethod = connex.thor.account('0x0000000000000000000000000000456e65726779').method(transferABI)
                transferMethod.gas(-1)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('method(...).gasPrice:invalid string value should throw', done => {
            try {
                const transferMethod = connex.thor.account('0x0000000000000000000000000000456e65726779').method(transferABI)
                transferMethod.gasPrice('0b00')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('method(...).asClause:invalid string value should throw', done => {
            try {
                const transferMethod = connex.thor.account('0x0000000000000000000000000000456e65726779').method(transferABI)
                transferMethod.asClause('invalid address', 'invalid amount')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

    })

    describe('connex.thor.filter', () => {

        it('filter:invalid kind should throw', done => {
            try {
                connex.thor.filter('invalid kind' as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('event filter:invalid address should throw', done => {
            try {
                const filter = connex.thor.filter('event')
                filter.criteria([{
                    address: "invalid address"
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('event filter:invalid topic2 should throw', done => {
            try {
                const filter = connex.thor.filter('event')
                filter.criteria([{
                    topic2: "invalid bytes32"
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('event filter:invalid from and to should throw', done => {
            try {
                const filter = connex.thor.filter('event')
                filter.range({
                    unit: 'block',
                    from: 1,
                    to: 0,
                })
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('transfer filter:invalid txOrigin should throw', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.criteria([{
                    txOrigin: "invalid txOrigin"
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('transfer filter:invalid sender should throw', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.criteria([{
                    sender: "invalid sender"
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('transfer filter:invalid recipient should throw', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.criteria([{
                    recipient: "invalid recipient"
                }])
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('filter:invalid range should throw', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.range(null as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('filter:invalid range.unit should throw', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.range({
                    unit: 'invalid unit'
                } as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('filter:invalid range.from should throw', done => {
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
                done()
            }
        })

        it('filter:invalid range.to should throw', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.range({
                    unit: 'block',
                    to: 'invalid to'
                } as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('filter:invalid order should throw', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.order('invalid order' as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('filter:invalid offset should throw', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.apply(-1, -1)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('filter:invalid offset should throw', done => {
            try {
                const filter = connex.thor.filter('transfer')
                filter.apply(0, 1000)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
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
            }
        })

        it('invalid type should throw', done => {
            try {
                connex.vendor.sign('invalid' as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('tx-request:invalid to should throw', done => {
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
                done()
            }
        })

        it('tx-request:invalid data should throw', done => {
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
                done()
            }
        })

        it('tx-request:invalid data should throw', done => {
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
                done()
            }
        })

        it('tx-request:invalid comment should throw', done => {
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
                done()
            }
        })

        it('tx-request.comment:invalid comment should throw', done => {
            const txSigner = connex.vendor.sign('tx')
            try {
                txSigner.comment({} as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('tx-request:invalid signer should throw', done => {
            const txSigner = connex.vendor.sign('tx')
            try {
                txSigner.signer('invalid address')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('cert-request:invalid signer should throw', done => {
            const txSigner = connex.vendor.sign('cert')
            try {
                txSigner.signer('invalid address')
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('cert-request:invalid message should throw', done => {
            const txSigner = connex.vendor.sign('cert')
            try {
                txSigner.request(0 as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('cert-request:invalid purpose should throw', done => {
            const txSigner = connex.vendor.sign('cert')
            try {
                txSigner.request({
                    purpose: 'invalid'
                } as any)
                done(new Error('Should throw error'))
            } catch (err) {
                expect(err.name).to.be.equal('BadParameter')
                done()
            }
        })

        it('cert-request:invalid payload.type should throw', done => {
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
                done()
            }
        })

        it('cert-request:invalid payload.content should throw', done => {
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
                done()
            }).catch(err => {
                done(err)
            })
        })
    })

})

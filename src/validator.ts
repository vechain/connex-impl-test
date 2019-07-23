const { isBytes32, isUint64, isUint32, isUint8, isAddress, isInt, isBytes8, isHexBytes } = require('./types')

const { expect } = require('chai') 

export function ensureBlock(val: Connex.Thor.Block) {
    expect(isAddress(val.beneficiary), 'block.beneficiary should be an address').to.be.true
    expect(isUint64(val.gasLimit, 'block.gasLimit should be a uint64')).to.be.true
    expect(isUint64(val.gasUsed), 'block.gasUsed should be a uint64').to.be.true
    expect(isBytes32(val.id), 'block.id should be a bytes32').to.be.true
    expect(isUint32(val.number), 'block.number should be a uint32').to.be.true
    expect(isBytes32(val.parentID), 'block.parentID should be a bytes32').to.be.true
    expect(isBytes32(val.receiptsRoot), 'block.receiptsRoot should be a bytes32').to.be.true
    expect(isAddress(val.signer), 'block.signer should be an address').to.be.true
    expect(isInt(val.size), 'block.size should be an int').to.be.true
    expect(isBytes32(val.stateRoot), 'block.stateRoot should be a bytes32').to.be.true
    expect(isUint64(val.timestamp), 'block.timestamp should be a uint64').to.be.true
    expect(isUint64(val.totalScore), 'block.totalScore should be a uint64').to.be.true
    expect(isBytes32(val.txsRoot), 'block.txsRoot should be a bytes32').to.be.true
    expect(val.transactions).to.be.an('array', 'block.transactions should be an array')
    val.transactions.forEach(tx => {
        expect(isBytes32(tx), 'tx should be a bytes32').to.be.true
    })
}

export function ensureStatus(val: Connex.Thor.Status) {
    expect(isBytes32(val.head.id), 'head.id should be a bytes32').to.be.true
    expect(isUint32(val.head.number), 'head.number should be a uint32').to.be.true
    expect(isUint64(val.head.timestamp), 'head.timestamp should be a uint64').to.be.true
    expect(isBytes32(val.head.parentID), 'head.parentID should be a bytes32').to.be.true
    expect(val.progress).to.be.at.least(0).to.be.at.most(1)
}

export function ensureTransaction(val: Connex.Thor.Transaction) {
    expect(isBytes8(val.blockRef), 'tx.blockRef should be a bytes8').to.be.true
    expect(isUint8(val.chainTag), 'tx.chainTag should be a uint8').to.be.true
    if (val.dependsOn) expect(isBytes32(val.dependsOn), 'tx.dependsOn should be a bytes32 or null').to.be.true
    expect(isUint32(val.expiration), 'tx.expiration should be a uint32').to.be.true
    expect(isUint64(val.gas), 'tx.gas should be a uint64').to.be.true
    expect(isUint8(val.gasPriceCoef), 'tx.gasPriceCoef should be a uint8').to.be.true
    expect(isBytes32(val.id), 'tx.id should be a bytes32').to.be.true
    expect(isHexBytes(val.nonce), 'tx.nonce should be a hex format string').to.be.true
    expect(isAddress(val.origin), 'tx.origin should be an address').to.be.true
    expect(isInt(val.size), 'tx.size should be an int').to.be.true
    expect(val.clauses).to.be.an('array', 'tx.clauses should be an array')
    val.clauses.forEach(clause => {
        if (clause.to) expect(isAddress(clause.to), 'clause.to should be an address').to.be.true
        expect(isHexBytes(clause.value), 'clause.value should be a hex format string').to.be.true
        expect(isHexBytes(clause.data), 'clause.data should be a hex format string').to.be.true
    })
    ensureTransactionMeta(val.meta)
}

export function ensureTransactionMeta(val: Connex.Thor.Transaction.Meta) {
    expect(isBytes32(val.blockID), 'tx.meta.blockID should be a bytes32').to.be.true
    expect(isUint64(val.blockNumber), 'tx.meta.blockNumber should be a uint64').to.be.true
    expect(isUint32(val.blockTimestamp), 'tx.meta.blockTimestamp should be a uint32').to.be.true
}

export function ensureTransactionReceipt(val: Connex.Thor.Receipt) {
    expect(isAddress(val.gasPayer), 'receipt.gasPayer should be an address').to.be.true
    expect(isUint64(val.gasUsed), 'receipt.gasUsed should be a uint64').to.be.true
    expect(isHexBytes(val.paid), 'receipt.paid should be a hex format string').to.be.true
    expect(isHexBytes(val.reward), 'receipt.reward should be a hex format string').to.be.true
    expect(val.reverted).to.be.an('boolean', 'receipt.reverted should be a boolean')
    ensureLogMeta(val.meta)
    expect(val.outputs).to.be.an('array', 'tx.outputs should be an array')
    val.outputs.forEach(output => {
        if (output.contractAddress) expect(isAddress(output.contractAddress), 'output.contractAddress should be an address').to.be.true
        expect(output.events).to.be.an('array', 'output.events should be an array')
        expect(output.transfers).to.be.an('array', 'output.transfers should be an array')
        output.events.forEach(event => { 
            ensureEventLog(event)
        })
        output.transfers.forEach(transfer => {
            ensureTransferLog(transfer)
        })
    })
}

export function ensureLogMeta(val: Connex.Thor.Receipt.Meta) {
    expect(isBytes32(val.blockID), 'meta.blockID should be a bytes32').to.be.true
    expect(isUint64(val.blockNumber), 'meta.blockNumber should be a uint64').to.be.true
    expect(isUint32(val.blockTimestamp), 'meta.blockTimestamp should be a uint32').to.be.true
    expect(isBytes32(val.txID), 'meta.txID should be a bytes32').to.be.true
    expect(isAddress(val.txOrigin), 'meta.txOrigin should be an address').to.be.true
}

export function ensureEventLog(val: Connex.Thor.Event, checkMeta = false) {
    expect(isAddress(val.address), 'event.address should be an address').to.be.true
    expect(isHexBytes(val.data), 'event.data should be a hex format string').to.be.true
    expect(val.topics).to.be.an('array', 'event.topics should be an array')
    val.topics.forEach(topic => {
        expect(isBytes32(topic), 'event topic should be a bytes32').to.be.true
    })
    if(checkMeta) ensureLogMeta(val.meta as Connex.Thor.LogMeta)
}

export function ensureTransferLog(val: Connex.Thor.Transfer, checkMeta = false) {
    expect(isAddress(val.sender), 'transfer.sender should be an address').to.be.true
    expect(isAddress(val.recipient), 'transfer.recipient should be an address').to.be.true
    expect(isHexBytes(val.amount), 'transfer.amount should be a hex format string').to.be.true
    if (checkMeta) ensureLogMeta(val.meta as Connex.Thor.LogMeta)
}

export function ensureAccount(val: Connex.Thor.Account) {
    expect(isHexBytes(val.balance), 'account.balance should be a hex format string').to.be.true
    expect(isHexBytes(val.energy), 'account.energy should be a hex format string').to.be.true
    expect(val.hasCode).to.be.an('boolean', 'account.hasCode should be a boolean')
}

export function ensureVMOutput(val: Connex.Thor.VMOutput) {
    expect(isHexBytes(val.data), 'data should be a hex format string').to.be.true
    expect(isUint64(val.gasUsed), 'gasUsed should be a uint64').to.be.true
    expect(val.reverted).to.be.an('boolean', 'reverted should be a boolean')
    expect(val.vmError).to.be.a('string', 'vmError should be a string')
    expect(val.events).to.be.an('array', 'events should be an array')
    expect(val.transfers).to.be.an('array', 'transfers should be an array')
    val.events.forEach(event => {
        ensureEventLog(event)
    })
    val.transfers.forEach(transfer => {
        ensureTransferLog(transfer)
    })
}

export function ensureEventCriteria(val: Connex.Thor.Event.Criteria) {
    expect(isAddress(val.address), 'address should be an address').to.be.true
    const keys: Array<keyof Connex.Thor.Event.Criteria> = ['topic0', 'topic1', 'topic2', 'topic3', 'topic4']
    for (let key of keys){
        if (val[key]) {
            expect(isBytes32(val[key]), `${key} should be a bytes32`).to.be.true
        }
    }
}
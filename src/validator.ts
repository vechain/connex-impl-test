const { isBytes32, isUint64, isUint32, isAddress, isInt } = require('./types')

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
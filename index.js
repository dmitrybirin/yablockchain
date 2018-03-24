const SHA256 = require('crypto-js/sha256')

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index
        this.timestamp = timestamp
        this.data = data
        this.previousHash = previousHash
        this.hash = this.calculateHash()
        this.nonce = 0
    }

    calculateHash() {
        const importantData = [
            this.index,
            this.previousHash,
            this.timestamp,
            JSON.stringify(this.data),
            this.nonce,
        ]

        return SHA256(importantData.join()).toString()
    }

    mineBlock(difficulty) {
        const startTime = +new Date()
        while (this.hash.substring(0, difficulty) !== '0'.repeat(difficulty)) {
            this.nonce++
            this.hash = this.calculateHash()
        }
        const endTime = +new Date()

        console.log(`
            BLOCK MINED!
            hash: ${this.hash}
            nonce: ${this.nonce}
            time: ${(endTime-startTime)/1000}s`)
    }
}

class Blockchain {
    constructor(difficulty) {
        this.chain = [this.createGenesisBlock()]
        this.difficulty = difficulty
    }

    createGenesisBlock() {
        return new Block(0, +new Date(), 'Genesis block', '0')
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1]
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash
        newBlock.mineBlock(this.difficulty)
        this.chain.push(newBlock)
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i]
            const previousBlock = this.chain[i - 1]

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false
            }
        }

        return true
    }
}

let yablockchain = new Blockchain(4)
console.log('Mining block 1...')
yablockchain.addBlock(new Block(1, +new Date(), 'one string'))

console.log('Mining block 2...')
yablockchain.addBlock(new Block(2, +new Date(), 'another one string'))


console.log(yablockchain.isChainValid())
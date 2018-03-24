const SHA256 = require('crypto-js/sha256')
const uuidv4 = require('uuid/v4')

class Transaction {
    constructor(fromAddress, toAddress, amount, debug = true) {
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.amount = amount
        if (debug) {
            console.log(`${String(amount).padEnd(4)} :: ${String(fromAddress).padEnd(15)} -->     ${String(toAddress).padEnd(15)}`)
        }
    }
}

class Block {
    constructor(transactions, previousHash = '') {
        this.id = uuidv4()
        this.timestamp = +new Date()
        this.transactions = transactions
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
            time: ${(endTime - startTime) / 1000}s`)
    }
}

class Blockchain {
    constructor(difficulty) {
        this.chain = [this.createGenesisBlock()]
        this.pendingTransactions = []
        this.pendingBlocks = []

        this.difficulty = difficulty
        this.miningReward = 100
        this.transactionsVolume = 2
    }

    createGenesisBlock() {
        return new Block([new Transaction(null, 'Alice', 1000)])
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1]
    }

    createTransaction(transaction) {
        this.pendingTransactions.push(transaction)
        if (this.pendingTransactions.length >= this.transactionsVolume) {
            this.pendingBlocks.push(new Block(this.pendingTransactions))
            this.pendingTransactions = []
        }
    }

    minePendingBlock(miningRewardAddress) {
        if (this.pendingBlocks.length) {
            const block = this.pendingBlocks.shift()
            block.mineBlock(this.difficulty)
            this.chain.push(block)
            this.pendingTransactions = [
                new Transaction(null, miningRewardAddress, this.miningReward),
            ]
        } else {
            console.warn('No pending blocks!')
        }
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash
        newBlock.mineBlock(this.difficulty)
        this.chain.push(newBlock)
    }

    getBalanceOfAddress(address) {
        let balance = 0

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount
                }

                if (trans.toAddress === address) {
                    balance += trans.amount
                }
            }
        }

        return balance
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

yablockchain.createTransaction(new Transaction('Alice', 'Bob', 100))
yablockchain.createTransaction(new Transaction('Eva', 'Alice', 50))
yablockchain.createTransaction(new Transaction('Minerguy', 'Alice', 150))
yablockchain.createTransaction(new Transaction('Minerguy', 'Bob', 30))

yablockchain.minePendingBlock('Minerguy')
console.log(`
    Minerguy mined block.
    Bob's balance in system: ${yablockchain.getBalanceOfAddress('Bob')}
    Minerguy's balance in system: ${yablockchain.getBalanceOfAddress('Minerguy')}
`)

yablockchain.minePendingBlock('Minerguy')
console.log(`
    Minerguy mined block.
    Bob's balance in system: ${yablockchain.getBalanceOfAddress('Bob')}
    Minerguy's balance in system: ${yablockchain.getBalanceOfAddress('Minerguy')}
`)

console.log(yablockchain.isChainValid())

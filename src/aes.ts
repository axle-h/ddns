import crypto from 'node:crypto'

const AES_128_CBC = 'aes-128-cbc'

export class AesCrypto {
    constructor(
        // the router insists that these are numbers and the algorithm that they are 16 bytes
        // 16 0's seems to work anyway...
        private readonly keyString: string = '0000000000000000',
        private readonly ivString: string = '0000000000000000'
    ) {}

    getKeyString() {
        return `k=${this.keyString}&i=${this.ivString}`
    }

    encrypt(payload: string): string {
        const cipher = crypto.createCipheriv(AES_128_CBC, this.keyString, this.ivString)
        const b1 = cipher.update(payload, 'utf8')
        const b2 = cipher.final()
        const result = Buffer.concat([b1, b2]).toString('base64')
        return result
    }
    
    decrypt(encrypted: string): string {
        const decipher = crypto.createDecipheriv(AES_128_CBC, this.keyString, this.ivString)
        const encryptedBytes = Buffer.from(encrypted, 'base64')
        const b1 = decipher.update(encryptedBytes)
        const b2 = decipher.final()
        return Buffer.concat([b1, b2]).toString('utf8')
    }
}
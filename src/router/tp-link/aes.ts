import crypto from 'node:crypto'

const AES_128_CBC = 'aes-128-cbc'

// the router insists that the key & iv are 16 decimal digits, used as ascii bytes
function randomDigits(length: number = 16): string {
    return Array.from({ length }, () => crypto.randomInt(10)).join('')
}

export class AesCrypto {
    constructor(
        private readonly keyString: string = randomDigits(),
        private readonly ivString: string = randomDigits()
    ) {}

    getKeyString() {
        return `k=${this.keyString}&i=${this.ivString}`
    }

    encrypt(payload: string): string {
        const cipher = crypto.createCipheriv(AES_128_CBC, this.keyString, this.ivString)
        const b1 = cipher.update(payload, 'utf8')
        const b2 = cipher.final()
        return Buffer.concat([b1, b2]).toString('base64')
    }

    decrypt(encrypted: string): string {
        const decipher = crypto.createDecipheriv(AES_128_CBC, this.keyString, this.ivString)
        const encryptedBytes = Buffer.from(encrypted, 'base64')
        const b1 = decipher.update(encryptedBytes)
        const b2 = decipher.final()
        return Buffer.concat([b1, b2]).toString('utf8')
    }
}
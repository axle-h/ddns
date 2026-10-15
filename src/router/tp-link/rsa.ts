import crypto from 'node:crypto'
import { RsaPublicKey } from './types'

function hexToBase64Url(hex: string): string {
    return Buffer.from(hex.length % 2 === 0 ? hex : '0' + hex, 'hex').toString('base64url')
}

export class RsaPublicEncryption {
    private readonly key: crypto.KeyObject

    constructor([n, e]: RsaPublicKey) {
        this.key = crypto.createPublicKey({
            key: { kty: 'RSA', n: hexToBase64Url(n), e: hexToBase64Url(e) },
            format: 'jwk'
        })
    }

    // PKCS#1 v1.5, hex encoded at the full modulus length
    encrypt(plainText: string): string {
        return crypto.publicEncrypt(
            { key: this.key, padding: crypto.constants.RSA_PKCS1_PADDING },
            Buffer.from(plainText, 'utf8')
        ).toString('hex')
    }
}

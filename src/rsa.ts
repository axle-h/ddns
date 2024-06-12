import { BigInteger } from 'jsbn'
import crypto from 'node:crypto'
import { RsaPublicKey } from './types'

export class RsaPublicEncryption {
    private readonly n: BigInteger
    private readonly paddedCipherLength: number
    private readonly e: number

    constructor([n, e]: RsaPublicKey) {
        this.n = new BigInteger(n, 16)
        this.e = parseInt(e, 16)
        this.paddedCipherLength = n.length || 256
    }

    encrypt(plainText: string): string {
        // PKCS#1(m)^e (mod n)
        const cipherText = this.pkcs1pad2(plainText).modPowInt(this.e, this.n).toString(16)

        const result = (cipherText.length & 1) == 0 ? cipherText : '0' + cipherText

        var cipherPadding = result.length % this.paddedCipherLength
        return result.padStart(cipherPadding + result.length, '0')
    }

    // PKCS#1 (type 2, random) pad input string s to n bytes, and return a bigint
    private pkcs1pad2(s: string) {
        let n = (this.n.bitLength() + 7) >> 3
        if (n < s.length + 11) {
            throw new Error("Message too long for RSA")
        }

        const ba = new Array()
        let i = s.length - 1
        while (i >= 0 && n > 0) {
            var c = s.charCodeAt(i--)
            if (c < 128) { // encode using utf-8
                ba[--n] = c
            }
            else if ((c > 127) && (c < 2048)) {
                ba[--n] = (c & 63) | 128
                ba[--n] = (c >> 6) | 192
            }
            else {
                ba[--n] = (c & 63) | 128
                ba[--n] = ((c >> 6) & 63) | 128
                ba[--n] = (c >> 12) | 224
            }
        }
        ba[--n] = 0

        while (n > 2) { // random non-zero pad
            let pad = 0
            while (pad == 0) {
                pad = crypto.randomBytes(1)[0]
            }
            ba[--n] = pad
        }
        ba[--n] = 2
        ba[--n] = 0
        return new BigInteger(ba)
    }
}

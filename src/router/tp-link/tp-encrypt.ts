import crypto from "node:crypto"
import { Config } from "./config"
import { RsaPublicEncryption } from "./rsa"
import { AesCrypto } from "./aes"

interface EncryptedPayload {
    sign: string
    data: string
}

const USERNAME = 'admin'

export class TpEncrypt {
    private readonly passwordRsa: RsaPublicEncryption
    private readonly aes: AesCrypto
    private readonly rsa: RsaPublicEncryption
    private readonly hash: string
    private readonly seq: number

    constructor(config: Config, pwd: string) {
        this.passwordRsa = new RsaPublicEncryption(config.passwordKey.password)
        this.aes = new AesCrypto()
        this.rsa = new RsaPublicEncryption(config.encryptionKey.key)
        this.hash = crypto.createHash(config.isRgSec ? 'sha256' : 'md5').update(USERNAME + pwd).digest('hex'),
        this.seq = config.encryptionKey.seq
    }

    private signature(deltaSeq: number, isLogin: boolean) {
        let s = `h=${this.hash}&s=${this.seq + deltaSeq}`
        if (isLogin) {
            s = this.aes.getKeyString() + '&' + s
        }
        let sign = "", pos = 0
        while(pos < s.length) {
            sign += this.rsa.encrypt(s.substring(pos, pos + 53))
            pos = pos + 53
        }
        return sign
    }

    passwordEncrypt(password: string): string {
        return this.passwordRsa.encrypt(password)
    }

    dataEncrypt(data: string): EncryptedPayload {
        const isLogin = data.indexOf('operation=login') >= 0
        const encrypted = this.aes.encrypt(data);
        return {
            sign: this.signature(encrypted.length, isLogin),
            data: encrypted
        }
    }

    dataDecrypt(data: string): string {
        return this.aes.decrypt(data)
    }
}
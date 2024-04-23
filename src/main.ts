import { encrypt } from "./encrypt"
import { webcrypto } from "node:crypto"

const ROUTER_HOST = '10.0.0.1'

interface RouterResponse<T> {
    success: boolean
    data: T
}

type RsaKey = [string, string]

interface PasswordKey {
    password: RsaKey
    mode: string
    username: string
}

interface EncryptionKey {
    key: RsaKey
    seq: number
}

async function request<T>(type: string, body: string): Promise<T> {
    const response = await fetch(
        `http://${ROUTER_HOST}/cgi-bin/luci/;stok=${type}`,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body
        }
    )
    
    if (response.status !== 200) {
        throw new Error(`cannot get ${type} expected 200 but got ${response.status} ${response.statusText}: ${await response.json()}`)
    }

    const result = (await response.json()) as RouterResponse<T>
    if (result.success !== true) {
        throw new Error(`result does not indicate success: ${result}`)
    }

    return result.data
}

async function getPasswordKey(): Promise<PasswordKey> {
    return request('/login?form=keys', 'operation=read')
}

async function getEncryptionKey(): Promise<EncryptionKey> {
    return request('/login?form=auth', 'operation=read')
}

function rand(): number {
    const randomBuffer = new Uint32Array(1)
    webcrypto.getRandomValues(randomBuffer)
    return randomBuffer[0] / (0xFFFFFFFF + 1)
}

function getRandomIntInclusive(min: number, max: number) {
    var minValue = Math.ceil(min)
    var maxValue = Math.floor(max)
    return Math.floor(rand() * (maxValue - minValue + 1)) + minValue
}

function generateRandomIntString(length: number) {
    var result = ""
    for(;length--;){
        result += getRandomIntInclusive(0,9);
    }
    return result;
}

function genAesKey() {
    // line 51 tpEncrypt.js
    const KEY_LEN = 128 / 8
    const IV_LEN = 16

    var key = generateRandomIntString(KEY_LEN)
    var iv = generateRandomIntString(IV_LEN)

    // TODO continue here
}

class Encrypter {
    constructor(private readonly keys: EncryptionKey) {
        
    }

    public loginSignature() {
        const s = this.aesKeyString + "&h=" + this.hash + "&s=" + seq || this.seq;
    }
}

async function main() {
    const auth = await getEncryptionKey()
    console.log(auth)

    const keys = await getPasswordKey()
    const encrypted = encrypt('hello', keys.password)
    console.log(encrypted)
}

main().then(() => {}).catch(e => console.error(e))




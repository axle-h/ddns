import { TpEncrypt } from "./tp-encrypt"
import { Country, Device, EncryptionKey, Language, PasswordKey, RouterResponse, Status } from "./types"

async function assertOk(response: Response) {
    if (response.status !== 200) {
        throw new Error(`request failed ${response.status} ${response.statusText}: ${await response.text()}`)
    }
}

export class PlainTextClient {
    constructor(private readonly host: string) {}

    private async luci<T>(stok: string, body: string): Promise<T> {
        const response = await fetch(
            `http://${this.host}/cgi-bin/luci/;stok=${stok}`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body
            }
        )
        await assertOk(response)
    
        const result = (await response.json()) as RouterResponse<T>
        if (result.success !== true) {
            throw new Error(`result does not indicate success: ${JSON.stringify(result)}`)
        }
        return result.data
    }

    async getLang(): Promise<Language> {
        return this.luci('/locale?form=lang', 'operation=read')
    }

    async getCountry(): Promise<Country> {
        return this.luci('/locale?form=country', 'operation=read')
    }

    async getDevice(): Promise<Device> {
        const response = await fetch(
            `http://${this.host}/webpages/config/device.json`,
            {
                method: 'POST',
                headers: { Accept: 'application/json' },
            }
        )
        await assertOk(response)
        return await response.json()
    }
    
    async getPasswordKey(): Promise<PasswordKey> {
        return this.luci('/login?form=keys', 'operation=read')
    }
    
    async getEncryptionKey(): Promise<EncryptionKey> {
        return this.luci('/login?form=auth', 'operation=read')
    }
}

export class EncryptedClient {
    private readonly cookies: Record<string, string> = {}
    private session: string = ''

    constructor(
        private readonly encryption: TpEncrypt,
        private readonly host: string
    ) {}

    private async luci<T>(stok: string, payload: string): Promise<T> {
        const { sign, data } = this.encryption.dataEncrypt(payload)
        const body = `sign=${encodeURIComponent(sign)}&data=${encodeURIComponent(data)}`

        const response = await fetch(
            `http://${this.host}/cgi-bin/luci/;stok=${this.session}${stok}`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join(';')
                },
                body,
            }
        )
        await assertOk(response)

        const encryptedResult = await response.json()
        let result: RouterResponse<T>
        try {
            result = JSON.parse(this.encryption.dataDecrypt(encryptedResult.data))
        } catch (e) {
            throw new Error(`cannot decrypt router response: ${JSON.stringify(encryptedResult)}`, { cause: e })
        }
    
        if (result.success !== true) {
            throw new Error(`result does not indicate success: ${JSON.stringify(result)}`)
        }

        this.parseCookies(response)
        return result.data
    }

    private parseCookies(response: Response) {
        for (const entry of response.headers.getSetCookie()) {
            const cookie = entry.split(';', 1)[0]
            const i = cookie.indexOf('=')
            if (i > 0) {
                this.cookies[cookie.substring(0, i)] = cookie.substring(i + 1)
            }
        }
    }

    async login(password: string): Promise<void> {
        const encryptedPassword = this.encryption.passwordEncrypt(password)
        const { stok } = await this.luci<{ stok: string }>('/login?form=login', `password=${encryptedPassword}&operation=login`)
        this.session = stok
    }

    async status(): Promise<Status> {
        return this.luci('/admin/status?form=all', 'operation=read')
    }

    // the router only allows one admin session, so leaving it open locks out the web ui
    async logout(): Promise<void> {
        await this.luci('/admin/system?form=logout', 'operation=write')
        this.session = ''
    }
}



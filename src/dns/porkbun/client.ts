import {DnsProvider} from "../provider";


export class PorkbunClient {
    constructor(
        private readonly apikey: string,
        private readonly secretKey: string,
        private readonly baseAddress: string = 'https://porkbun.com') {
    }

    async listDomains() {
        const response = await fetch(
            `${this.baseAddress}/api/json/v3/domain/listAll`,
            { body: JSON.stringify(this.auth()), method: 'POST' }
        )
        console.log(await response.json())
    }

    async getDnsRecords(domain: string) {
        const response = await fetch(
            `${this.baseAddress}/api/json/v3/dns/retrieve/ax-h.com`,
            { body: JSON.stringify(this.auth()), method: 'POST' }
        )
        console.log(await response.json())
    }

    private auth() {
        return {
            secretapikey: this.secretKey,
            apikey: this.apikey
        }
    }
}
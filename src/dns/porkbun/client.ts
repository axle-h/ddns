export class PorkbunClient {
    constructor(
        private readonly apikey: string,
        private readonly secretKey: string,
        private readonly baseAddress: string = 'https://api.porkbun.com') {
    }

    async listDomains(): Promise<Domain[]> {
        const response = await this.request<ListDomainsResponse>('/api/json/v3/domain/listAll')
        return response.domains
    }

    async listDnsRecords(domain: string): Promise<DnsRecord[]> {
        const response = await this.request<ListDnsRecordsResponse>(`/api/json/v3/dns/retrieve/${domain}`)
        return response.records
    }

    async updateDnsRecord(domain: string, record: DnsRecord): Promise<void> {
        await this.request(
            `/api/json/v3/dns/edit/${domain}/${record.id}`,
            {
                // this api does not support a FQ domain, the apex is an empty name
                name: record.name === domain ? '' : record.name.slice(0, -(domain.length + 1)),
                type: record.type,
                content: record.content,
                // otherwise reset to the default
                ttl: record.ttl
            }
        )
    }

    private async request<R extends PorkbunResponse>(url: string, request: any = {}): Promise<R> {
        const response = await fetch(this.baseAddress + url, {
            body: JSON.stringify({
                ...request,
                secretapikey: this.secretKey,
                apikey: this.apikey
            }),
            method: 'POST'
        })
        if (!response.ok && !response.headers.get('content-type')?.includes('json')) {
            throw new Error(`porkbun api response ${response.status} ${response.statusText}`)
        }
        const body: R = await response.json()
        if (body.status !== 'SUCCESS') {
            throw new Error(`porkbun api response ${body.status} ${body.message}`)
        }
        return body
    }
}

interface PorkbunResponse {
    status: 'SUCCESS' | 'ERROR'
    message?: string
}

export interface Domain {
    domain: string
}

interface ListDomainsResponse extends PorkbunResponse {
    domains: Domain[]
}

export interface DnsRecord {
    id: string // '12345'
    name: string // 'home.example.com'
    type: string // 'A'
    content: string // '8.8.8.8'
    ttl: string // '600'
}

interface ListDnsRecordsResponse extends PorkbunResponse {
    records: DnsRecord[]
}
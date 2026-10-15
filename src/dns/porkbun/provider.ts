import {DnsProvider} from "../provider";
import {DnsRecord, PorkbunClient} from "./client";

export class PorkbunDnsProvider implements DnsProvider {
    constructor(private readonly client: PorkbunClient) {}

    private domains: Promise<string[]> | null = null
    private dnsRecords = new Map<string, Promise<(DnsRecord & { domain: string })[]>>()

    async setDnsRecord(domain: string, wanAddress: string): Promise<void> {
        const dnsRecords = await this.getDnsRecords(domain)
        const record = dnsRecords.find(record =>
            record.name === domain && record.type === 'A')

        if (!record) {
            console.error(`cannot find domain ${domain}`)
            return
        }

        if (record.content === wanAddress) {
            console.info(`domain ${domain} does not need updating`)
            return
        }

        console.info(`updating domain ${domain} ${record.content} -> ${wanAddress}`)

        await this.client.updateDnsRecord(record.domain, {
            ...record,
            content: wanAddress
        })

        record.content = wanAddress
    }

    // only query the zone that owns the hostname, other domains in the account may not have API access
    private async getDnsRecords(hostname: string) {
        if (this.domains === null) {
            this.domains = this.client.listDomains()
                .then(domains => domains.map(domain => domain.domain))
        }

        const domain = (await this.domains)
            .find(domain => hostname === domain || hostname.endsWith(`.${domain}`))
        if (!domain) {
            return []
        }

        let dnsRecords = this.dnsRecords.get(domain)
        if (!dnsRecords) {
            dnsRecords = this.client.listDnsRecords(domain)
                .then(records => records.map(record => ({...record, domain})))
            this.dnsRecords.set(domain, dnsRecords)
        }
        return dnsRecords
    }
}
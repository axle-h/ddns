import {DnsProvider} from "../provider";
import {DnsRecord, PorkbunClient} from "./client";

export class PorkbunDnsProvider implements DnsProvider {
    constructor(private readonly client: PorkbunClient) {}

    private dnsRecords: Promise<(DnsRecord & { domain: string })[]> | null = null

    async setDnsRecord(domain: string, wanAddress: string): Promise<void> {
        if (this.dnsRecords === null) {
            this.dnsRecords = this.getDnsRecords()
        }

        const dnsRecords = await this.dnsRecords
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

    private async getDnsRecords() {
        const domains = await this.client.listDomains()
        const domainRecords = await Promise.all(
            domains.map(async domain => ({
                domain: domain.domain,
                dns: await this.client.listDnsRecords(domain.domain)
            }))
        )
        return domainRecords.flatMap(({domain, dns}) =>
            dns.map(record => ({...record, domain})))
    }
}
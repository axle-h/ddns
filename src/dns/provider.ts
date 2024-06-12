export interface DnsProvider {
    setDnsRecord(domain: string, wanAddress: string): Promise<void>
}
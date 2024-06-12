import {DnsProvider} from "../provider";
import {PorkbunClient} from "./client";

export class PorkbunDnsProvider implements DnsProvider {
    constructor(private readonly client: PorkbunClient) {}

    async setDnsRecord(domain: string, wanAddress: string): Promise<void> {
        // 1. list domains
        // 2. get the specific dns record
        // 4. update it if required
        await this.client.listDomains()
    }

}
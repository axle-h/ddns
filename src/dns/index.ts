import {DnsProvider} from "./provider";
import {PorkbunDnsProvider} from "./porkbun/provider";
import {PorkbunClient} from "./porkbun/client";

export enum DnsProviderType {
    Porkbun = 1
}

export interface DnsProviderConfig {
    type: DnsProviderType
    apiKey: string
    secretKey: string
}

export function buildDnsProvider(config: DnsProviderConfig): DnsProvider {
    switch (config.type) {
        case DnsProviderType.Porkbun:
            return new PorkbunDnsProvider(new PorkbunClient(config.apiKey, config.secretKey))
    }
}

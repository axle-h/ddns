import {buildRouter, RouterConfig, RouterType} from "./router";
import * as process from "node:process";
import { resolve4 } from 'node:dns/promises'
import {buildDnsProvider, DnsProviderConfig, DnsProviderType} from "./dns";

async function main() {
    const domains = process.env['DOMAINS']
        ?.split(',')
        ?.map(domain => domain.trim())
        ?? []

    if (domains.length === 0) {
        console.error('must provide DOMAINS')
        process.exit(1)
    }

    const routerConfig: RouterConfig = {
        host: process.env['ROUTER_HOST'],
        password: process.env['ROUTER_PASSWORD'],
        type: RouterType[(process.env['ROUTER_TYPE'] || 'TpLink') as keyof typeof RouterType]
    }
    if (!routerConfig.host || !routerConfig.password) {
        console.error('must provide ROUTER_HOST & ROUTER_PASSWORD')
        process.exit(1)
    }

    const dnsConfig: DnsProviderConfig = {
        type: DnsProviderType[(process.env['DNS_TYPE'] || 'Porkbun') as keyof typeof DnsProviderType],
        apiKey: process.env['DNS_API_KEY'],
        secretKey: process.env['DNS_SECRET_KEY'],
    }
    if (!dnsConfig.apiKey || !dnsConfig.secretKey) {
        console.error('must provide DNS_API_KEY & DNS_SECRET_KEY')
        process.exit(1)
    }

    const dnsProvider = buildDnsProvider(dnsConfig)

    const router = await buildRouter(routerConfig)
    const routerStatus = await router.status()
    console.info(`WAN ${routerStatus.wanAddress}`)

    for (let domain of domains) {
        const ips = await resolve4(domain)
        if (ips.includes(routerStatus.wanAddress)) {
            console.info(`OK ${domain}`)
        } else {
            console.info(`BAD domain=${domain} ips=${ips}`)
            await dnsProvider.setDnsRecord(domain, routerStatus.wanAddress)
        }
    }
}

main().then(() => {}).catch(e => console.error(e))

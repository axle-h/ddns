import {buildRouter, RouterConfig, RouterType} from "./router";
import {RouterStatus} from "./router/router";
import process from "node:process";
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
        type: requireEnum(RouterType, 'ROUTER_TYPE', 'TpLink'),
        host: requireEnv('ROUTER_HOST'),
        password: requireEnv('ROUTER_PASSWORD')
    }

    const dnsConfig: DnsProviderConfig = {
        type: requireEnum(DnsProviderType, 'DNS_TYPE', 'Porkbun'),
        apiKey: requireEnv('DNS_API_KEY'),
        secretKey: requireEnv('DNS_SECRET_KEY')
    }

    const dnsProvider = buildDnsProvider(dnsConfig)

    const router = await buildRouter(routerConfig)
    let routerStatus: RouterStatus
    try {
        routerStatus = await router.status()
    } finally {
        await router.logout().catch(e => console.error('failed to logout of router', e))
    }
    console.info(`WAN ${routerStatus.wanAddress}`)

    for (const domain of domains) {
        try {
            const ips = await resolveOrEmpty(domain)
            if (ips.includes(routerStatus.wanAddress)) {
                console.info(`OK ${domain}`)
            } else {
                console.info(`BAD domain=${domain} ips=${ips}`)
                await dnsProvider.setDnsRecord(domain, routerStatus.wanAddress)
            }
        } catch (e) {
            console.error(`failed to update ${domain}`, e)
            process.exitCode = 1
        }
    }
}

function requireEnv(name: string): string {
    const value = process.env[name]
    if (!value) {
        console.error(`must provide ${name}`)
        process.exit(1)
    }
    return value
}

function requireEnum<T extends number>(type: Record<string, string | T>, name: string, defaultValue: string): T {
    const key = process.env[name] || defaultValue
    const value = type[key]
    if (typeof value !== 'number') {
        console.error(`unknown ${name} ${key}`)
        process.exit(1)
    }
    return value
}

async function resolveOrEmpty(domain: string): Promise<string[]> {
    try {
        return await resolve4(domain)
    } catch (e) {
        const code = (e as NodeJS.ErrnoException).code
        if (code === 'ENOTFOUND' || code === 'ENODATA') {
            return []
        }
        throw e
    }
}

main().catch(e => {
    console.error(e)
    process.exitCode = 1
})

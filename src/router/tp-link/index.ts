import {Router, RouterStatus} from "../router";
import {Config} from "./config";
import {TpEncrypt} from "./tp-encrypt";
import {EncryptedClient} from "./client";

export class TpLinkRouter implements Router {
    constructor(private readonly client: EncryptedClient) {}

    async status(): Promise<RouterStatus> {
        const status = await this.client.status()
        return {
            wanAddress: status.wan_ipv4_ipaddr
        }
    }

    static async build(host: string, password: string): Promise<TpLinkRouter> {
        const config = await Config.build(host)
        const tpEncrypt = new TpEncrypt(config, password)
        const client = new EncryptedClient(tpEncrypt, host)
        await client.login(password)

        return new TpLinkRouter(client)
    }
}
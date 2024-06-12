import { EncryptedClient } from "./client"
import { Config } from "./config"
import { TpEncrypt } from "./tp-encrypt"

const PASSWORD = ''

async function main() {
    const config = await Config.build()
    const tpEncrypt = new TpEncrypt(config, PASSWORD)

    const client = new EncryptedClient(tpEncrypt)
    await client.login(PASSWORD)
    
    const status = await client.status()
    console.log(status.wan_ipv4_ipaddr)
}

main().then(() => {}).catch(e => console.error(e))

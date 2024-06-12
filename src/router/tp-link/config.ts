import { PlainTextClient } from "./client";
import { Country, Device, Language, PasswordKey, EncryptionKey } from "./types";

export class Config {
    constructor(
        public readonly device: Device,
        public readonly language: Language,
        public readonly country: Country,
        public readonly passwordKey: PasswordKey,
        public readonly encryptionKey: EncryptionKey
    ) {}

    static async build(host: string): Promise<Config> {
        const client = new PlainTextClient(host)
        return new Config(
            await client.getDevice(),
            await client.getLang(),
            await client.getCountry(),
            await client.getPasswordKey(),
            await client.getEncryptionKey()
        )
    }

    get isRgSec(): boolean {
        return this.device.supportRgSec.indexOf(this.country.country.toUpperCase()) >= 0
    }
}
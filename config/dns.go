package config

type Dns struct {
	Mode       string
	Domain     string
	SubDomain  string
	Cloudflare CloudflareConfig
}

func (config Dns) FullDomain() string {
	return config.SubDomain + "." + config.Domain
}

type CloudflareConfig struct {
	ApiKey string
	Email  string
}

const dnsSection = "dns"
const cloudflareSection = "cloudflare"

func (factory *ViperFactory) Dns() Dns {
	return Dns{
		Mode:      factory.string(dnsSection, "mode"),
		Domain:    factory.string(dnsSection, "domain"),
		SubDomain: factory.string(dnsSection, "sub_domain"),
		Cloudflare: CloudflareConfig{
			ApiKey: factory.string(dnsSection, cloudflareSection, "api_key"),
			Email:  factory.string(dnsSection, cloudflareSection, "email"),
		},
	}
}

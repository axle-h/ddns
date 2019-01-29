package config

type DnsConfig struct {
	Mode       string
	Domain     string
	SubDomain  string
	Cloudflare CloudflareConfig
}

func (config DnsConfig) FullDomain() string {
	return config.SubDomain + "." + config.Domain
}

type CloudflareConfig struct {
	ApiKey string
	Email  string
}

const dnsSection = "dns"
const cloudflareSection = "cloudflare"

func (factory ViperFactory) DnsConfig() DnsConfig {
	return DnsConfig{
		Mode:      factory.string(dnsSection, "mode"),
		Domain:    factory.string(dnsSection, "domain"),
		SubDomain: factory.string(dnsSection, "sub_domain"),
		Cloudflare: CloudflareConfig{
			ApiKey: factory.string(dnsSection, cloudflareSection, "api_key"),
			Email:  factory.string(dnsSection, cloudflareSection, "email"),
		},
	}
}

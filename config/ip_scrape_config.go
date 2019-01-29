package config

type IpScrapeConfig struct {
	Mode           string
	DefaultGateway string
}

const ipModeSection = "ip_scrape"

func (factory ViperFactory) IpScrapeConfig() IpScrapeConfig {
	return IpScrapeConfig{
		Mode:           factory.string(ipModeSection, "mode"),
		DefaultGateway: factory.string(ipModeSection, "default_gateway"),
	}
}

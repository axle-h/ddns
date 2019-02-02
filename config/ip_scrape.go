package config

type IpScrape struct {
	Mode           string
	DefaultGateway string
}

const ipModeSection = "ip_scrape"

func (factory *ViperFactory) IpScrape() IpScrape {
	return IpScrape{
		Mode:           factory.string(ipModeSection, "mode"),
		DefaultGateway: factory.string(ipModeSection, "default_gateway"),
	}
}

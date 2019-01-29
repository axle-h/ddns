package ip

import (
	"errors"
	"fmt"
	"github.com/axle-h/ddns/config"
	"github.com/axle-h/ddns/log"
	"github.com/axle-h/ddns/rest"
)

func NewScraper(configFactory config.Factory, logger log.Logger, restFactory rest.Factory) (Scraper, error) {
	cfg := configFactory.IpScrapeConfig()

	logger.Debug("scraping using mode: ", cfg.Mode)

	switch cfg.Mode {
	case "sky_hub":
		return NewSkyHubScraper(cfg, logger, restFactory), nil
	default:
		return nil, errors.New(fmt.Sprint("unknown scrape mode: ", cfg.Mode))
	}
}

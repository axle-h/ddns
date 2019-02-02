package ip

import (
	"errors"
	"fmt"
	"github.com/axle-h/ddns/config"
	"github.com/axle-h/ddns/ip/sky_hub"
	"github.com/axle-h/ddns/log"
	"github.com/axle-h/ddns/rest"
)

type Scraper interface {
	Scrape() (string, error)
}

func NewScraper(configFactory config.Factory, logger log.Logger, restFactory rest.Factory) (Scraper, error) {
	cfg := configFactory.IpScrape()

	logger.Debug("scraping using mode: ", cfg.Mode)

	switch cfg.Mode {
	case "sky_hub":
		return sky_hub.New(cfg, logger, restFactory), nil
	default:
		return nil, errors.New(fmt.Sprint("unknown scrape mode: ", cfg.Mode))
	}
}
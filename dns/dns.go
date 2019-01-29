package dns

import (
	"errors"
	"github.com/axle-h/ddns/config"
	"github.com/axle-h/ddns/dns/cloudflare"
	"github.com/axle-h/ddns/log"
	"github.com/axle-h/ddns/rest"
)

func NewClient(configFactory config.Factory, logger log.Logger, restFactory rest.Factory) (Client, error) {
	cfg := configFactory.DnsConfig()

	logger.Debug("resolving remote DNS record with service: ", cfg.Mode)

	switch cfg.Mode {
	case "cloudflare":
		return cloudflare.New(cfg, logger, restFactory), nil
	default:
		return nil, errors.New("unknown remote DNS mode: " + cfg.Mode)
	}
}

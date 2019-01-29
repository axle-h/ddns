package config

import (
	"github.com/axle-h/ddns/log"
	"github.com/spf13/viper"
	"strings"
)

type Factory interface {
	DnsConfig() DnsConfig

	IpScrapeConfig() IpScrapeConfig
}

type ViperFactory struct {
	logger log.Logger
	viper  *viper.Viper
}

func New(logger log.Logger, viper *viper.Viper) Factory {
	return ViperFactory{logger, viper}
}

func (factory ViperFactory) string(tokens ...string) string {
	key := strings.Join(tokens, ".")
	value := factory.viper.GetString(key)
	factory.logger.Debugf("%s: %s", key, value)
	return value
}

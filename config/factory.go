package config

//go:generate mockgen -source ./factory.go -destination ../mock/config/factory.go

import (
	"github.com/axle-h/ddns/log"
	"github.com/spf13/viper"
	"strings"
)

type Factory interface {
	Dns() Dns

	IpScrape() IpScrape
}

type ViperFactory struct {
	logger log.Logger
	viper  *viper.Viper
}

func New(logger log.Logger, viper *viper.Viper) Factory {
	return &ViperFactory{logger, viper}
}

func (factory *ViperFactory) string(tokens ...string) string {
	key := strings.Join(tokens, ".")
	value := factory.viper.GetString(key)
	factory.logger.Debugf("%s: %s", key, value)
	return value
}

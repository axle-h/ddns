package rest

import (
	"github.com/axle-h/ddns/log"
	"net/http"
	"strings"
)

type Factory interface {
	Get(baseUrl string) Client
}

type HttpFactory struct {
	logger log.Logger
}

func NewFactory(logger log.Logger) Factory {
	return &HttpFactory{logger}
}

func (factory *HttpFactory) Get(baseUrl string) Client {
	baseUrl = strings.TrimRight(baseUrl, "/") + "/"
	var headers = make(map[string]string)
	return &HttpClient{factory.logger, baseUrl, headers, http.Client{}}
}

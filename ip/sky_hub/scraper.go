package sky_hub

import (
	"errors"
	"github.com/axle-h/ddns/config"
	"github.com/axle-h/ddns/log"
	"github.com/axle-h/ddns/rest"
	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
	"regexp"
	"strings"
)

type SkyHubScraper struct {
	logger     log.Logger
	restClient rest.Client
}

func New(config config.IpScrape, logger log.Logger, restFactory rest.Factory) *SkyHubScraper {
	url := "http://" + config.DefaultGateway
	logger.Debug("sky hub scraper configured", url)

	restClient := restFactory.Get(url)
	return &SkyHubScraper{logger, restClient}
}

func (scraper *SkyHubScraper) Scrape() (string, error) {
	response, err := scraper.restClient.GetRaw("")
	if err != nil {
		return "", err
	}

	defer response.Close()

	tokenizer := html.NewTokenizer(response)

	inCandidate := false
	configRegex := regexp.MustCompile("var\\s+wanDslLinkConfig\\s+=\\s+(?:['\"])(.+)(?:['\"]);")
	ipv4Regex := regexp.MustCompile("(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])")

	for {
		switch tt := tokenizer.Next(); tt {
		case html.ErrorToken:
			// End of the document, we did not find the expected script block
			return "", errors.New("failed parse public IP address from Sky Hub")

		case html.StartTagToken:
			t := tokenizer.Token()
			if t.DataAtom == atom.Script {

				isInline, isJavascript := true, false
				for _, attr := range t.Attr {
					switch attr.Key {
					case "src":
						isInline = false
					case "type":
						isJavascript = attr.Val == "text/javascript"
					}
				}

				inCandidate = isInline && isJavascript
			}

		case html.EndTagToken:
			if inCandidate {
				t := tokenizer.Token()
				inCandidate = t.DataAtom == atom.Script
			}

		case html.TextToken:
			if !inCandidate {
				continue
			}

			t := strings.TrimSpace(tokenizer.Token().Data)
			if t == "" {
				continue
			}

			configMatch := configRegex.FindStringSubmatch(t)
			if len(configMatch) != 2 {
				continue
			}

			wanDslLinkConfig := configMatch[1]
			scraper.logger.Debug("found wanDslLinkConfig: ", wanDslLinkConfig)

			for _, token := range strings.Split(wanDslLinkConfig, "_") {
				if ipv4Regex.MatchString(token) {
					return token, nil
				}
			}

			return "", errors.New("could not find valid ipv4 address in wanDslLinkConfig: " + wanDslLinkConfig)
		}
	}
}

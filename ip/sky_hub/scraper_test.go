package sky_hub

import (
	"fmt"
	"github.com/axle-h/ddns/config"
	"github.com/axle-h/ddns/mock/log"
	"github.com/axle-h/ddns/mock/rest"
	"github.com/golang/mock/gomock"
	"github.com/icrowley/fake"
	"io/ioutil"
	"strings"
	"testing"
)

func testSkyHubScraper(t *testing.T, html string) (publicIp, result string, err error) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	cfg := config.IpScrape{DefaultGateway: fake.IPv4()}
	logger := mock_log.NewMockLogger(ctrl)
	restFactory := mock_rest.NewMockFactory(ctrl)
	restClient := mock_rest.NewMockClient(ctrl)

	logger.EXPECT().Debug(gomock.Any()).AnyTimes()

	restFactory.EXPECT().
		Get("http://" + cfg.DefaultGateway).
		Return(restClient)

	publicIp = fake.IPv4()
	response := fmt.Sprintf(html, publicIp)

	restClient.EXPECT().
		GetRaw("").
		Return(ioutil.NopCloser(strings.NewReader(response)), nil)

	scraper := New(cfg, logger, restFactory)
	result, err = scraper.Scrape()
	return publicIp, result, err
}

func Test_ignores_src_script_blocks(t *testing.T) {
	html := "<script type='text/javascript' src='/script.js'></script>"

	_, _, err := testSkyHubScraper(t, html)

	if err == nil {
		t.Error("expected error but got nil")
	}
}

func Test_ignores_non_javascript_script_blocks(t *testing.T) {
	html := "<script>var wanDslLinkConfig = '1_ipoe_0_1_0.101_1.2.3.4';</script>"

	_, _, err := testSkyHubScraper(t, html)

	if err == nil {
		t.Error("expected error but got nil")
	}
}

func Test_successful_scrape(t *testing.T) {
	html := "<script type='text/javascript'>var wanDslLinkConfig = '1_ipoe_0_1_0.101_%s';</script>"

	publicIp, result, err := testSkyHubScraper(t, html)

	if err != nil {
		t.Error(err)
	}

	if result != publicIp {
		t.Errorf("expected scrape to return %s but got %s", publicIp, result)
	}
}
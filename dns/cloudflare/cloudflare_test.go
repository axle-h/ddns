package cloudflare

import (
	"fmt"
	"github.com/axle-h/ddns/config"
	"github.com/axle-h/ddns/mock/log"
	"github.com/axle-h/ddns/mock/rest"
	"github.com/golang/mock/gomock"
	"github.com/icrowley/fake"
	"testing"
)

func getMocks(ctrl *gomock.Controller) (config.Dns, *mock_log.MockLogger, *mock_rest.MockFactory, *mock_rest.MockClient) {
	cfg := config.Dns{
		Domain: fake.DomainName(),
		SubDomain: fake.Word(),
		Cloudflare: config.CloudflareConfig{
			ApiKey: fake.Characters(),
			Email: fake.EmailAddress(),
		},
	}

	logger := mock_log.NewMockLogger(ctrl)
	logger.EXPECT().Debug(gomock.Any()).AnyTimes()
	logger.EXPECT().Debugf(gomock.Any(), gomock.Any()).AnyTimes()
	logger.EXPECT().Infof(gomock.Any(), gomock.Any()).AnyTimes()

	restFactory := mock_rest.NewMockFactory(ctrl)
	restClient := mock_rest.NewMockClient(ctrl)
	restFactory.EXPECT().Get(ApiUrl).Return(restClient)

	restClient.EXPECT().SetHeader("Accept", "application/json")
	restClient.EXPECT().SetHeader("User-Agent","ddns")
	restClient.EXPECT().SetHeader("X-Auth-Key", cfg.Cloudflare.ApiKey)
	restClient.EXPECT().SetHeader("X-Auth-Email", cfg.Cloudflare.Email)

	return cfg, logger, restFactory, restClient
}

func Test_get_dns_id(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	cfg, logger, restFactory, restClient := getMocks(ctrl)

	z := zone{
		Id: fake.Characters(),
		Name: cfg.Domain,
	}

	restClient.EXPECT().
		Get("zones", gomock.Any()).
		Return(nil).
		Do(func(url string, result *getZonesResult) {
			dummy := zone{ Name: fake.Characters() }
			result.Zones = []zone { dummy, z }
		})

	client := New(cfg, logger, restFactory)

	dnsId, err := client.GetDnsId()

	if err != nil {
		t.Error(err)
	}

	if dnsId != z.Id {
		t.Errorf("expected %s but got %s", z.Id, dnsId)
	}
}

func Test_get_current_ip(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	cfg, logger, restFactory, restClient := getMocks(ctrl)

	dnsId := fake.Characters()

	getRecord := func(typ string, name string) dnsRecord {
		return dnsRecord{
			Type: typ,
			Name: name,
			Content: fake.IPv4(),
		}
	}

	record := getRecord(DnsRecordType, cfg.FullDomain())

	restClient.EXPECT().
		Get(fmt.Sprintf("zones/%s/dns_records", dnsId), gomock.Any()).
		Return(nil).
		Do(func(url string, result *getDnsRecordsResult) {
			dummy1 := getRecord(DnsRecordType, fake.Characters())
		    dummy2 := getRecord(fake.Characters(), cfg.FullDomain())
			result.DnsRecords = []dnsRecord { dummy1, dummy2, record }
		})

	client := New(cfg, logger, restFactory)

	ip, err := client.GetCurrentIp(dnsId)

	if err != nil {
		t.Error(err)
	}

	if ip != record.Content {
		t.Errorf("expected %s but got %s", record.Content, ip)
	}
}
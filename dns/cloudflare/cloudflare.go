package cloudflare

import (
	"errors"
	"github.com/axle-h/ddns/config"
	"github.com/axle-h/ddns/log"
	"github.com/axle-h/ddns/rest"
	"strings"
)

type getZonesResult struct {
	Zones []zone `json:"result"`
}

type zone struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

type getDnsRecordsResult struct {
	DnsRecords []dnsRecord `json:"result"`
}

type dnsRecord struct {
	Id      string `json:"id"`
	Type    string `json:"type"`
	Name    string `json:"name"`
	Content string `json:"content"`
	Ttl     int    `json:"ttl"`
	Proxied bool   `json:"proxied"`
}

type createOrUpdatednsRecordRequest struct {
	Type    string `json:"type"`
	Name    string `json:"name"`
	Content string `json:"content"`
	Ttl     int    `json:"ttl"`
	Proxied bool   `json:"proxied"`
}

type Client struct {
	config config.Dns
	logger log.Logger
	rest   rest.Client
}

const DnsRecordType = "A"
const ApiUrl = "https://api.cloudflare.com/client/v4"

func New(config config.Dns, logger log.Logger, restFactory rest.Factory) Client {
	restClient := restFactory.Get(ApiUrl)
	restClient.SetHeader("Accept", "application/json")
	restClient.SetHeader("User-Agent","ddns")
	restClient.SetHeader("X-Auth-Key", config.Cloudflare.ApiKey)
	restClient.SetHeader("X-Auth-Email", config.Cloudflare.Email)

	return Client{config, logger, restClient}
}

func (client Client) GetDnsId() (string, error) {
	url := getUrl("zones")
	result := getZonesResult{}

	if err := client.rest.Get(url, &result); err != nil {
		return "", err
	}

	for _, z := range result.Zones {
		if z.Name == client.config.Domain {
			client.logger.Debugf("domain %s has zone id %s", client.config.Domain, z.Id)
			return z.Id, nil
		}
	}

	return "", errors.New("cannot find zone on cloudflare: " + client.config.Domain)
}

func (client Client) GetCurrentIp(dnsId string) (string, error) {
	record, err := client.getDnsRecord(dnsId)
	if err != nil {
		return "", err
	}

	if record == nil {
		return "", errors.New("cannot find domain on cloudflare: " + client.config.FullDomain())
	}

	return record.Content, nil
}

func (client Client) UpsertIp(dnsId string, ip string) error {
	record, err := client.getDnsRecord(dnsId)
	if err != nil {
		return err
	}

	if record == nil {
		client.logger.Debug("cloudflare DNS record does not exist")
		return client.createDnsRecord(dnsId, ip)
	}

	if record.Content == ip {
		client.logger.Debug("cloudflare DNS record already in sync")
		return nil
	}

	client.logger.Debug("cloudflare DNS record is out of date")
	record.Content = ip
	return client.updateDnsRecord(dnsId, record.Id, ip)
}

func (client Client) getDnsRecord(zoneId string) (*dnsRecord, error) {
	url := getDnsRecordsUrl(zoneId)
	result := getDnsRecordsResult{}
	if err := client.rest.Get(url, &result); err != nil {
		return nil, err
	}

	qualifiedDomain := client.config.FullDomain()

	for _, d := range result.DnsRecords {
		if d.Type == DnsRecordType && d.Name == qualifiedDomain {
			client.logger.Debugf("remote domain %s resolves to %s", qualifiedDomain, d.Content)
			return &d, nil
		}
	}

	return nil, nil
}

func (client Client) createDnsRecord(zoneId string, ip string) error {
	request := createOrUpdatednsRecordRequest{
		Type:    DnsRecordType,
		Content: ip,
		Name:    client.config.FullDomain(),
		Proxied: false,
		Ttl:     120,
	}

	client.logger.Infof("creating cloudflare DNS request %s: %s", request.Name, request.Content)

	url := getDnsRecordsUrl(zoneId)
	return client.rest.Post(url, &request, nil)
}

func (client Client) updateDnsRecord(zoneId string, id string, ip string) error {
	request := createOrUpdatednsRecordRequest{
		Type:    DnsRecordType,
		Content: ip,
		Name:    client.config.FullDomain(),
		Proxied: false,
		Ttl:     120,
	}

	client.logger.Infof("updating cloudflare DNS request %s: %s", request.Name, request.Content)

	url := getDnsRecordsUrl(zoneId) + "/" + id
	return client.rest.Put(url, &request, nil)
}

func getUrl(segments ...string) string {
	return strings.Join(segments, "/")
}

func getDnsRecordsUrl(zoneId string) string {
	return getUrl("zones", zoneId, "dns_records")
}

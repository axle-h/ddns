package dns

type Client interface {
	GetDnsId() (string, error)

	GetCurrentIp(dnsId string) (string, error)

	UpsertIp(dnsId string, ip string) error
}

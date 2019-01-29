package dns

type Client interface {
	GetCurrentIp() (string, error)

	UpsertIp(ip string) error
}

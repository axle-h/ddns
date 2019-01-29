[![CircleCI](https://circleci.com/gh/axle-h/ddns.svg?style=svg)](https://circleci.com/gh/axle-h/ddns)

# ddns

Scrape IP address from router and push to online service. Currently supports scraping remote IP address from Sky Hub
and managing a remote DNS record with Cloudflare.

## Configuration

Requires configuration file `$HOME/.ddns.yml`.

```yaml
ip_scrape:
  mode: sky_hub
  default_gateway: 192.168.0.1

dns:
  mode: "cloudflare"
  domain: your-domain-with-cloudflare-managed-dns.com
  sub_domain: home
  cloudflare:
    api_key: your-cloudflare-api-key
    email: your-email-address@gmail.com
```

## Usage

```bash
ddns [command]
```

Available Commands:

|Command|Description|
|-------|-----------|
|help|Help about any command|
|dns|Retrieve remote DNS record content for configured provider and domain|
|ip|Scrape public IP address from configured source|
|sync|Ensures the public IP address and remote DNS record are synchronised|

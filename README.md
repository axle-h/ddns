[![CircleCI](https://circleci.com/gh/axle-h/ddns.svg?style=svg)](https://circleci.com/gh/axle-h/ddns)

# ddns

Scrape IP address from router and push to remote DNS service. Currently supports scraping remote IP address from Sky Hub
and managing a remote DNS record with Cloudflare.

## Why?

There are free dynamic DNS providers but to maintain your record they require that you login regularly.
If like me you CBA and have your own private domain then why not just push your dynamic DNS record directly to that instead?
Cloudflare DNS is free and has a decent API so I went with that.
Also to avoid having to trust another external provider to echo my public IP address I have written a quick scraper
for the management page on the Sky Hub, which exposes the public IP address (along with loads of other stuff)
in a JavaScript variable on the unauthenticated home page (!). 

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

package ip

type Scraper interface {
	Scrape() (string, error)
}
